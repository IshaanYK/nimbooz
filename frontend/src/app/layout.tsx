import type { Metadata } from "next";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "AASRA — Field-Aware Multilingual AI & Biological Return Engine",
  description: "AI companion for Indian farmers combining real weather telemetry, Sarvam voice AI, and Syngenta biological science.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#f8faf6]">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
