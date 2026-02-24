"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface NavbarProps {
  currentPage?: string;
}

export function Navbar({ currentPage }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/features", label: "Features" },
    { href: "#how", label: "How it Works" },
    { href: "#pricing", label: "Pricing" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-5 transition-all duration-300 backdrop-blur-xl ${
        scrolled ? "border-b border-border bg-bg/70" : "bg-bg/70 border-b border-transparent"
      }`}
    >
      <Link href="/" className="text-xl tracking-tight bg-gradient-to-r from-accent to-a78bfa bg-clip-text text-transparent font-syne font-extrabold">
        OutreachAI
      </Link>
      <ul className="flex items-center gap-8">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`text-sm font-normal transition-colors hover:text-text ${
                currentPage === link.href.slice(1) ? "text-text" : "text-muted2"
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="#"
            className="px-5 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent2 transition-colors"
          >
            Get Started
          </Link>
        </li>
      </ul>
    </nav>
  );
}
