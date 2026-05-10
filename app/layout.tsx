import type { Metadata } from "next";
import { IBM_Plex_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import BackgroundSketches from "@/components/background-sketches";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-display-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ani On Call",
  description: "Like having a numbers person in your contacts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ibmPlexMono.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background font-sans">
        <BackgroundSketches />
        <Nav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
