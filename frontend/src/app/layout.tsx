import type { Metadata, Viewport } from "next";
import { LanguageProvider } from "@/context/LanguageContext";
import { WeatherProvider } from "@/context/WeatherContext";
import { FarmProvider } from "@/context/FarmContext";
import { PwaRegistration } from "@/components/PwaRegistration";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#533afd",
};

export const metadata: Metadata = {
  title: "AASRA — Evidence-Based Precision Agriculture Intelligence",
  description: "Production-grade, location-aware decision support for farmers combining real weather telemetry, satellite monitoring, and deterministic agronomics. No fabricated data.",
  manifest: "/manifest.json",
  applicationName: "AASRA Kisan AI",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AASRA",
  },
  icons: {
    icon: "/images/aasra_logo.png",
    apple: "/images/aasra_logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="apple-touch-icon" href="/images/aasra_logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col bg-[#f8faf6]">
        <LanguageProvider>
          <WeatherProvider>
            <FarmProvider>
              {children}
              <PwaRegistration />
            </FarmProvider>
          </WeatherProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
