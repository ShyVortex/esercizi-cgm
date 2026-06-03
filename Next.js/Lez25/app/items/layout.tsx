"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isUtentiActive = pathname.startsWith("/items/users");
  const isAttivitaActive = pathname.startsWith("/items/tasks");

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-md-outline-variant/20 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-md-foreground">
            Gestione Risorse
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Visualizza e gestisci gli utenti del portale e le loro attività recenti.
          </p>
        </div>

        <div className="inline-flex rounded-full border border-md-outline-variant/35 p-1 bg-md-surface-container/30 self-start md:self-center">
          <Link
            href="/items/users"
            className={`transition-all duration-200 px-5 py-2 text-sm font-semibold rounded-full ${
              isUtentiActive
                ? "bg-md-primary text-white dark:text-zinc-950 shadow-sm"
                : "text-zinc-650 dark:text-zinc-350 hover:bg-zinc-150 dark:hover:bg-zinc-800/40"
            }`}
          >
            Utenti
          </Link>
          <Link
            href="/items/tasks"
            className={`transition-all duration-200 px-5 py-2 text-sm font-semibold rounded-full ${
              isAttivitaActive
                ? "bg-md-primary text-white dark:text-zinc-950 shadow-sm"
                : "text-zinc-650 dark:text-zinc-350 hover:bg-zinc-150 dark:hover:bg-zinc-800/40"
            }`}
          >
            Attività
          </Link>
        </div>
      </div>

      {/* Contenuto specifico della risorsa */}
      <div className="min-h-[400px]">{children}</div>
    </div>
  );
}
