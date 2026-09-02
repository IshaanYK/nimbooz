import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AASRA Admin Panel",
  description: "Internal admin panel for AASRA system management",
  robots: "noindex, nofollow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
