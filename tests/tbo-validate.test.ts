/**
 * TBO checklist validations — the gate that stops a booking BEFORE the card is
 * charged (/api/payment/order) and before a booking attempt is burned at TBO.
 */
import { describe, expect, it } from "vitest";
import {
  farePerPax,
  normalizeTitle,
  TboValidationError,
  validateGst,
  validatePax,
  type Pax,
} from "@/lib/tbo-validate";

const adult = (over: Partial<Pax> = {}): Pax => ({
  Title: "MR",
  FirstName: "Khush",
  LastName: "Patel",
  PaxType: 1,
  DateOfBirth: "1990-01-15T00:00:00",
  Gender: 1,
  IsLeadPax: true,
  ContactNo: "9999999999",
  Email: "lead@example.com",
  AddressLine1: "404 Setu Square, Ahmedabad",
  ...over,
});

describe("normalizeTitle", () => {
  it.each([
    ["Master", 3, 1, "MSTR"], // infant
    ["Miss", 2, 2, "MS"], // child
    ["mr", 1, 1, "MR"],
    ["MRS", 1, 2, "MRS"],
    ["Mstr", 1, 2, "MRS"], // invalid for adult → gender fallback
    ["", 1, 1, "MR"],
    ["", 2, 1, "MR"],
    ["", 3, 2, "MSTR"],
    ["garbage", 1, 2, "MRS"],
  ] as const)("(%s, pax %i, gender %i) → %s", (title, paxType, gender, want) => {
    expect(normalizeTitle(title, paxType, gender)).toBe(want);
  });
});

describe("validatePax", () => {
  const ctx = { isLCC: false, airlineCode: "AI" };

  it("passes a well-formed adult", () => {
    expect(() => validatePax([adult()], ctx)).not.toThrow();
  });

  it("requires at least one adult", () => {
    const child = adult({ PaxType: 2, IsLeadPax: false });
    expect(() => validatePax([child], ctx)).toThrow(TboValidationError);
  });

  it("rejects infants outnumbering adults", () => {
    const inf = (n: string) =>
      adult({ PaxType: 3, Title: "MSTR", FirstName: n, IsLeadPax: false, DateOfBirth: "2026-01-01T00:00:00" });
    expect(() => validatePax([adult(), inf("A"), inf("B")], ctx)).toThrow(/outnumber/i);
  });

  it("rejects names with . , / ( ) characters", () => {
    expect(() => validatePax([adult({ LastName: "Patel." })], ctx)).toThrow(/characters/);
  });

  it("requires a phone number on every pax", () => {
    expect(() => validatePax([adult({ ContactNo: "" })], ctx)).toThrow(/phone/i);
  });

  it('rejects a cell country code without "+"', () => {
    expect(() => validatePax([adult({ CellCountryCode: "91" })], ctx)).toThrow(/\+/);
  });

  it("requires DOB for children and infants", () => {
    const child = adult({ PaxType: 2, Title: "MR", DateOfBirth: "", IsLeadPax: false });
    expect(() => validatePax([adult(), child], ctx)).toThrow(/date of birth/i);
  });

  it("LCC: lead passenger must have email + address", () => {
    const lcc = { isLCC: true, airlineCode: "6E" };
    expect(() => validatePax([adult({ Email: "" })], lcc)).toThrow(/email/i);
    expect(() => validatePax([adult({ AddressLine1: "" })], lcc)).toThrow(/address/i);
    expect(() => validatePax([adult()], lcc)).not.toThrow();
  });

  it("SpiceJet: first and last name must differ", () => {
    expect(() =>
      validatePax([adult({ FirstName: "Patel", LastName: "Patel" })], { isLCC: true, airlineCode: "SG" }),
    ).toThrow(/different/i);
  });

  it("carries a machine-readable rule on the error", () => {
    try {
      validatePax([], ctx);
      expect.unreachable("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(TboValidationError);
      expect((e as TboValidationError).rule).toBe("pax");
    }
  });
});

describe("farePerPax", () => {
  it("splits the pax-type total by its passenger count (the ₹1000-for-2 → ₹500 rule)", () => {
    const per = farePerPax(
      [{ PassengerType: 1, PassengerCount: 2, BaseFare: 1000, Tax: 300, YQTax: 100 }],
      1,
    );
    expect(per.BaseFare).toBe(500);
    expect(per.Tax).toBe(150);
    expect(per.YQTax).toBe(50);
  });

  it("returns zeros when the pax type has no breakdown entry", () => {
    expect(farePerPax([], 2).BaseFare).toBe(0);
    expect(farePerPax(undefined, 1).Tax).toBe(0);
  });
});

describe("validateGst", () => {
  it("is a no-op when GST is not mandatory", () => {
    expect(() => validateGst({}, undefined)).not.toThrow();
  });

  it("requires company name + number when the FareQuote flags GST mandatory", () => {
    expect(() => validateGst({ IsGSTMandatory: true }, undefined)).toThrow(TboValidationError);
    expect(() =>
      validateGst({ IsGSTMandatory: true }, { GSTCompanyName: "Acme", GSTNumber: "" }),
    ).toThrow();
    expect(() =>
      validateGst({ IsGSTMandatory: true }, { GSTCompanyName: "Acme", GSTNumber: "24AAXFR7477D1ZL" }),
    ).not.toThrow();
  });
});
