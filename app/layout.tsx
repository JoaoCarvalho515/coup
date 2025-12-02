import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GithubButton } from "@/components/github-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coup",
  description: "Coup - Bluff • Deduce • Dominate",
  openGraph: {
    title: "Coup",
    description: "Coup - Bluff • Deduce • Dominate",
    url: "https://coup.mjfactor.com", // Placeholder URL, can be updated
    siteName: "Coup",
    images: [
      {
        url: "/2.png",
        width: 1200,
        height: 630,
        alt: "Coup Game",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GithubButton />
        {children}
      </body>
    </html>
  );
}
