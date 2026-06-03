"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/items/users", label: "Risorse", activePattern: /^\/risorse/ },
    { href: "/settings", label: "Impostazioni" },
  ];

  const isActive = (link: typeof links[0]) => {
    if (link.activePattern) {
      return link.activePattern.test(pathname);
    }
    return pathname === link.href;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-zinc-950 dark:text-white"
          >
            <span>AdminPortal</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {links.map((link) => {
              const active = isActive(link);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-50 ${active
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-zinc-500 dark:text-zinc-400"
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
      <div className="md:hidden border-t border-zinc-100 dark:border-zinc-900 flex justify-around py-3 bg-white dark:bg-zinc-950">
        {links.map((link) => {
          const active = isActive(link);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs font-medium transition-colors ${active
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-zinc-500 dark:text-zinc-400"
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
