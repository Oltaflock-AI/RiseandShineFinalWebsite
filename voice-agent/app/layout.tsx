import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rise & Shine Travel — AI Voice Sales Engine",
  description:
    "Place an AI voice call to a travel lead and watch the qualified details land in the dashboard. Powered by Oltaflock.",
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2222%22 fill=%22%23f0a93b%22/><circle cx=%2250%22 cy=%2262%22 r=%2218%22 fill=%22%23fff3d6%22/><path d=%22M20 70h60%22 stroke=%22%23fff3d6%22 stroke-width=%226%22 stroke-linecap=%22round%22/></svg>",
      },
    ],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
