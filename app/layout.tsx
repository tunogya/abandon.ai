import type { Metadata } from "next";

import { GeistPixelSquare, GeistPixelCircle, GeistPixelLine, GeistPixelTriangle, GeistPixelGrid } from "geist/font/pixel";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "abandon.ai",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   <html
      lang="en"
      className={` ${geistSans.variable} ${geistMono.variable} ${GeistPixelSquare.variable} ${GeistPixelCircle.variable} ${GeistPixelLine.variable} ${GeistPixelTriangle.variable} ${GeistPixelGrid.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
