import type { Metadata, Viewport } from "next";
import { Orbitron, Outfit } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Xobx Controller",
  description: "Futuristic Mobile Game Controller",
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
    <html lang="en" className={`${orbitron.variable} ${outfit.variable}`}>
      <body className="font-outfit antialiased bg-[#0a0a0f] text-white">
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_10%_20%,rgba(0,242,255,0.05)_0%,transparent_50%),radial-gradient(circle_at_90%_80%,rgba(188,0,255,0.05)_0%,transparent_50%)]" />
        {children}
      </body>
    </html>
  );
}
