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
  metadataBase: new URL("https://tara-coup.vercel.app"),
  title: "Coup",
  description: "Coup - Bluff • Deduce • Dominate",
  openGraph: {
    title: "Coup",
    description: "Coup - Bluff • Deduce • Dominate",
    url: "https://tara-coup.vercel.app",
    siteName: "Coup",
    images: [
      {
        url: "https://tara-coup.vercel.app/ui/2.jpg",
        width: 1200,
        height: 630,
        alt: "Coup Game",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coup",
    description: "Coup - Bluff • Deduce • Dominate",
    images: ["https://tara-coup.vercel.app/ui/2.jpg"],
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
