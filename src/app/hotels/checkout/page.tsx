import type { Metadata } from "next";
import { HotelCheckoutView } from "@/components/checkout/HotelCheckoutView";

export const metadata: Metadata = {
  title: "Hotel Checkout",
  robots: { index: false },
};

export default function HotelCheckoutPage() {
  return <HotelCheckoutView />;
}
