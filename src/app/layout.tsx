import type { Metadata, Viewport } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import { BodyScrollGuard } from "@/components/admin/BodyScrollGuard";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Litalendar — Family Calendar",
  description: "A beautiful touch-first family calendar for Echo Show 15",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable}`}>
      <body className="font-body antialiased">
        <BodyScrollGuard />
        {children}
      </body>
    </html>
  );
}
