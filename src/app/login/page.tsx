import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { AUTH_DISABLED } from "@/lib/flags";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Rise & Shine Travels account to book and manage your trips.",
  robots: { index: false },
};

export default function LoginPage() {
  if (AUTH_DISABLED) redirect("/");
  return <AuthScreen mode="login" />;
}
