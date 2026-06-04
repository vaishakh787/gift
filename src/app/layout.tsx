import type { Metadata } from "next";
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
  title: "Gift Paths of Discovery",
  description: "Curate digital discovery paths for the next generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      {/* Added suppressHydrationWarning to silence extension-induced mismatches directly on the body node */}
      <body 
        suppressHydrationWarning 
        className="antialiased bg-gray-50 text-gray-900 min-h-screen"
      >
        {children}
      </body>
    </html>
  );
}