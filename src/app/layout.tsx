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
        <div id="cursor"></div>
        <div id="cursor-glow"></div>
        <script dangerouslySetInnerHTML={{__html: `
          const cursor = document.getElementById('cursor');
          const cursorGlow = document.getElementById('cursor-glow');
          let mouseX = 0;
          let mouseY = 0;
          
          document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.transform = \`translate(\${mouseX}px, \${mouseY}px)\`;
            cursorGlow.style.transform = \`translate(\${mouseX}px, \${mouseY}px)\`;
          });
        `}} />
      </body>
    </html>
  );
}
