"use client";

import React, { useState } from "react";
import Link from "next/link";
import data from "../../../data/data.json";
import SizeSelector from "@/app/components/SizeSelector";
import Pagination from "@/app/components/Pagination";
import { PreferencesService } from "@/app/services/preferences.service";

export default function UsersPage() {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return PreferencesService.loadPreferences().usersSize;
    }
    return 10;
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-md-surface-container/30 rounded-3xl border border-md-outline-variant/20 p-6 h-[400px] flex flex-col justify-between">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4 mb-4" />
          <div className="space-y-4 flex-1 justify-center flex flex-col">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-4/5" />
          </div>
        </div>
      </div>
    );
  }

  const sortedUsers = [...data.users].sort(
    (a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime()
  );

  const totalUsers = sortedUsers.length;
  const totalPages = Math.ceil(totalUsers / pageSize) || 1;

  // Riposiziona currentPage se va fuori limite dopo il cambio di pageSize
  const activePage = currentPage > totalPages ? totalPages : currentPage;

  const startIndex = (activePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Slice degli utenti correnti
  const currentUsers = sortedUsers.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    PreferencesService.savePreference('usersSize', newSize);
    setCurrentPage(1); // Resetta alla prima pagina
  };

  return (
    <div className="space-y-6">
      <div className="bg-background rounded-3xl border border-md-outline-variant/30 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-md-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-md-surface-container/20">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-md-foreground">Lista Utenti</h2>
            <span className="text-xs font-bold text-md-on-primary-container bg-md-primary-container px-3 py-1 rounded-full">
              {totalUsers} Utenti
            </span>
          </div>
          <SizeSelector
            value={pageSize}
            onChange={handlePageSizeChange}
            label="Utenti per pagina:"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-md-outline-variant/20 bg-md-surface-container/30 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <th className="px-6 py-4">Utente</th>
                <th className="px-6 py-4">Ruolo</th>
                <th className="px-6 py-4">Stato</th>
                <th className="px-6 py-4">Data Registrazione</th>
                <th className="px-6 py-4 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-md-outline-variant/15 text-sm">
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-md-surface-container/20 transition-colors">
                  <td className="px-6 py-4 flex items-center space-x-4">
                    <span className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-md-primary-container font-bold text-md-on-primary-container">
                      {user.avatar}
                    </span>
                    <div>
                      <div className="font-bold text-md-foreground">{user.name}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-md-foreground">
                    {user.role}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${user.status === "Attivo"
                      ? "bg-emerald-55/10 text-emerald-700 dark:text-emerald-450"
                      : "bg-amber-55/10 text-amber-700 dark:text-amber-450"
                      }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                    {new Date(user.joinedDate).toLocaleDateString("it-IT", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/items/users/${user.id}`}
                      className="text-sm font-bold text-md-primary hover:underline"
                    >
                      Dettaglio
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={activePage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
