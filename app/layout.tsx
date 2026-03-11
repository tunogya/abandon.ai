import type { Metadata } from "next";

import { GeistPixelSquare, GeistPixelCircle, GeistPixelLine, GeistPixelTriangle, GeistPixelGrid } from "geist/font/pixel";
import { Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "abandon.ai",
  description: "Remote Drone Mission Scheduling Platform.",
  icons: {
    icon: "/favicon.ico",
  },
};

const GA_MEASUREMENT_ID = "G-DWH7P05G35";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${GeistPixelSquare.variable} ${GeistPixelCircle.variable} ${GeistPixelLine.variable} ${GeistPixelTriangle.variable} ${GeistPixelGrid.variable}`}
    >
      <body>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
