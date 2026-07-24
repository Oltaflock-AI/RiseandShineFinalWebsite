/**
 * parseBookingRequest shapes what BOTH /api/payment/order and /api/book act on —
 * pre-charge validation and ticketing must see the identical request.
 */
import { describe, expect, it } from "vitest";
import { parseBookingRequest, type IncomingBooking } from "@/lib/booking-request";

const base = (): IncomingBooking => ({
  traceId: "trace-1",
  searchedAt: 1_700_000_000_000,
  resultIndex: "OB1",
  isLCC: true,
  airlineCode: "6e",
  flightNumber: "6E 123",
  origin: "amd",
  destination: "del",
  departDate: "2026-08-10T00:00:00",
  passengers: [
    {
      Title: "Mr",
      FirstName: "Khush",
      LastName: "Patel",
      PaxType: 1,
      Gender: 1,
      IsLeadPax: true,
      ContactNo: "9999999999",
      Email: "lead@example.com",
    },
  ],
});

describe("parseBookingRequest", () => {
  it.each(["traceId", "resultIndex", "origin", "destination", "departDate"] as const)(
    "rejects a body missing %s with a 400",
    (field) => {
      const body = base();
      delete body[field];
      const r = parseBookingRequest(body);
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.status).toBe(400);
        expect(r.error).toContain(field);
      }
    },
  );

  it("rejects an empty passenger list with a 400", () => {
    const r = parseBookingRequest({ ...base(), passengers: [] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(400);
  });

  it("uppercases route + airline codes", () => {
    const r = parseBookingRequest(base());
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.req.origin).toBe("AMD");
      expect(r.req.destination).toBe("DEL");
      expect(r.req.airlineCode).toBe("6E");
    }
  });

  it("defaults searchedAt to now when absent (TraceId window still enforced downstream)", () => {
    const body = base();
    delete body.searchedAt;
    const before = Date.now();
    const r = parseBookingRequest(body);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.req.searchedAt).toBeGreaterThanOrEqual(before);
  });

  it('normalizes "Master" on an infant to MSTR (TBO rejects "Master")', () => {
    const body = base();
    body.passengers!.push({
      Title: "Master",
      FirstName: "Baby",
      LastName: "Patel",
      PaxType: 3,
      Gender: 1,
      ContactNo: "9999999999",
    });
    const r = parseBookingRequest(body);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.req.passengers[1].Title).toBe("MSTR");
  });

  it('normalizes "Miss" on a child to MS', () => {
    const body = base();
    body.passengers!.push({
      Title: "Miss",
      FirstName: "Kiddo",
      LastName: "Patel",
      PaxType: 2,
      Gender: 2,
      ContactNo: "9999999999",
    });
    const r = parseBookingRequest(body);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.req.passengers[1].Title).toBe("MS");
  });

  it("falls back to a gender-appropriate title when the given one is invalid for the pax type", () => {
    const body = base();
    // "MSTR" is not a valid ADULT title → adult female falls back to MRS
    body.passengers = [
      { ...body.passengers![0], Title: "Mstr", Gender: 2, PaxType: 1 },
    ];
    const r = parseBookingRequest(body);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.req.passengers[0].Title).toBe("MRS");
  });
});
