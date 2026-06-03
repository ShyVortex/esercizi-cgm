"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/items/users", label: "Risorse", activePattern: /^\/items/ },
    { href: "/settings", label: "Impostazioni" },
  ];

  const isActive = (link: typeof links[0]) => {
    if (link.activePattern) {
      return link.activePattern.test(pathname);
    }
    return pathname === link.href;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-md-outline-variant/30">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl tracking-tight text-md-foreground"
          >
            <span>AdminPortal</span>
          </Link>
          <nav className="hidden md:flex items-center gap-3">
            {links.map((link) => {
              const active = isActive(link);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-all duration-200 px-4 py-2 rounded-full ${
                    active
                      ? "bg-md-primary-container text-md-on-primary-container font-semibold shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 font-medium"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      {/* Mobile nav */}
      <div className="md:hidden border-t border-md-outline-variant/20 flex justify-around py-2.5 bg-background">
        {links.map((link) => {
          const active = isActive(link);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs px-3 py-1.5 rounded-full transition-all duration-200 ${
                active
                  ? "bg-md-primary-container text-md-on-primary-container font-semibold"
                  : "text-zinc-500 dark:text-zinc-400 font-medium"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
