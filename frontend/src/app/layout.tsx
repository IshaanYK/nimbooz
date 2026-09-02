import type { Metadata } from "next";
import { LanguageProvider } from "@/context/LanguageContext";
import { WeatherProvider } from "@/context/WeatherContext";
import { FarmProvider } from "@/context/FarmContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "AASRA — Evidence-Based Precision Agriculture Intelligence",
  description: "Production-grade, location-aware decision support for farmers combining real weather telemetry, satellite monitoring, and deterministic agronomics. No fabricated data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#f8faf6]">
        <LanguageProvider>
          <WeatherProvider>
            <FarmProvider>
              {children}
            </FarmProvider>
          </WeatherProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
