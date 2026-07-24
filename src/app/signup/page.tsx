import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { AUTH_DISABLED } from "@/lib/flags";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a Rise & Shine Travels account to book flights, hotels and holidays.",
  robots: { index: false },
};

export default function SignupPage() {
  if (AUTH_DISABLED) redirect("/");
  return <AuthScreen mode="signup" />;
}
