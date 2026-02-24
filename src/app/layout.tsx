import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "OutreachAI — Outreach That Converts",
  description: "OutreachAI writes hyper-personalized cold emails, DMs, and follow-up sequences so you can focus on delivering — not prospecting.",
  openGraph: {
    title: "OutreachAI — Outreach That Converts",
    description: "AI-powered outreach for agencies and freelancers",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable}`}>
      <body className="font-inter antialiased">
        {children}
      </body>
    </html>
  );
}
