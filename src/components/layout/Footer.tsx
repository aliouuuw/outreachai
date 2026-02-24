import Link from "next/link";

export function Footer() {
  const links = [
    { href: "/features", label: "Features" },
    { href: "#", label: "How it Works" },
    { href: "#", label: "Pricing" },
    { href: "#", label: "Blog" },
    { href: "#", label: "Privacy" },
    { href: "#", label: "Terms" },
  ];

  return (
    <footer className="flex items-center justify-between px-10 py-14 border-t border-border max-w-4xl mx-auto">
      <div className="text-lg tracking-tight bg-gradient-to-r from-accent to-a78bfa bg-clip-text text-transparent font-syne font-extrabold">
        OutreachAI
      </div>
      <ul className="flex items-center gap-8 flex-wrap justify-center">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="text-xs font-normal text-muted hover:text-muted2 transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="text-xs font-light text-muted">© 2025 OutreachAI. All rights reserved.</div>
    </footer>
  );
}
