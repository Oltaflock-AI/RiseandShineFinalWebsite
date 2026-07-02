"use server";

/**
 * Enquiry form handler.
 *
 * Validates the submission and delivers it to the agency's own Google Form
 * ("Rise & Shine Travel Inquiry Form") via a server-side POST — no CORS, no
 * client fragility — so leads land in their Google Sheet while the site keeps
 * its on-brand form UI. If a package key is present (from a detail-page CTA),
 * the lead is enriched with that package's name, route and duration.
 */
import { CATALOG_PACKAGES, isCatalogPackage } from "@/data/catalog";
import {
  GOOGLE_FORM,
  buildFormBody,
  nightsToDayOption,
  type Lead,
} from "@/lib/googleForm";

export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CATEGORY_SERVICE: Record<string, string> = {
  domestic: "Domestic",
  international: "International",
  cruise: "International",
};

const JOURNEY_SERVICE: Record<string, string> = {
  Domestic: "Domestic",
  International: "International",
  Cruise: "International",
  Honeymoon: "International",
};

export async function submitEnquiry(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const val = (k: string) => String(formData.get(k) ?? "").trim();

  const name = val("name");
  const phone = val("phone");
  const email = val("email");

  if (name.length < 2) {
    return { status: "error", message: "Please tell us your name." };
  }
  if (phone.replace(/\D/g, "").length < 7) {
    return { status: "error", message: "Please add a valid phone number." };
  }
  if (email && !EMAIL_RE.test(email)) {
    return { status: "error", message: "That email address doesn't look right." };
  }

  const journeyType = val("journeyType");
  const packageKey = val("package");
  const pkg = isCatalogPackage(packageKey) ? CATALOG_PACKAGES[packageKey] : null;

  // Compose the "Additional Requirements" note from message + subject + package.
  const noteParts: string[] = [];
  const subject = val("subject");
  const message = val("message");
  if (subject) noteParts.push(`Subject: ${subject}`);
  if (message) noteParts.push(message);
  if (pkg) {
    noteParts.push(
      `Enquiry via website for package: ${pkg.tourName} (${pkg.durationNights}N/${pkg.durationDays}D — ${pkg.routeSummary}).`,
    );
  }

  // Services checkbox — from journey type, else the package category.
  const services: string[] = [];
  if (JOURNEY_SERVICE[journeyType]) services.push(JOURNEY_SERVICE[journeyType]);
  else if (pkg && CATEGORY_SERVICE[pkg.category])
    services.push(CATEGORY_SERVICE[pkg.category]);

  const lead: Lead = {
    name,
    phone,
    email: email || undefined,
    destination: val("destination") || pkg?.name || undefined,
    travellers: val("travellers") || undefined,
    budget: val("budget") || undefined,
    departure: val("departure") || undefined,
    message: noteParts.join("\n") || undefined,
    services: services.length ? services : undefined,
    days: pkg ? nightsToDayOption(pkg.durationNights) : undefined,
  };

  try {
    const res = await fetch(GOOGLE_FORM.responseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: buildFormBody(lead).toString(),
      // Google responds with an HTML confirmation page; we don't need to read it.
      cache: "no-store",
    });
    // Google returns 200 on success (and sometimes an opaque redirect). Treat a
    // non-network response as delivered.
    if (!res.ok && res.status !== 0) {
      throw new Error(`Google Form responded ${res.status}`);
    }
  } catch {
    return {
      status: "error",
      message:
        "We couldn't send that just now. Please try again, or reach us on WhatsApp / by phone and we'll help right away.",
    };
  }

  return {
    status: "success",
    message:
      "Thank you! Your enquiry has reached the Rise & Shine team. We'll be in touch very shortly.",
  };
}
