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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Gestione Risorse
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Visualizza e gestisci gli utenti del portale e le loro attività recenti.
        </p>

        {/* Sottomenu di navigazione */}
        <div className="mt-6 flex gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-px">
          <Link
            href="/items/users"
            className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${isUtentiActive
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
          >
            Utenti
          </Link>
          <Link
            href="/items/tasks"
            className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${isAttivitaActive
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
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
