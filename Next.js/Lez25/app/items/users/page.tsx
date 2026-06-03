"use client";

import Link from "next/link";
import data from "../../../data/data.json";
import SizeSelector from "@/app/components/SizeSelector";
import { useState } from "react";
import Pagination from "@/app/components/Pagination";

export default function UsersPage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const sortedUsers = [...data.users].sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime());

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
    setCurrentPage(1); // Resetta alla prima pagina
  };


  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">Lista Utenti</h2>
            <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 px-2.5 py-1 rounded-full">
              {totalUsers} Utenti Totali
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
              <tr className="border-b border-zinc-150 bg-zinc-50/75 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                <th className="px-6 py-3">Utente</th>
                <th className="px-6 py-3">Ruolo</th>
                <th className="px-6 py-3">Stato</th>
                <th className="px-6 py-3">Data Registrazione</th>
                <th className="px-6 py-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-sm">
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                  <td className="px-6 py-4 flex items-center space-x-3">
                    <span className="flex-shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {user.avatar}
                    </span>
                    <div>
                      <div className="font-medium text-zinc-950 dark:text-white">{user.name}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                    {user.role}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.status === "Attivo"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
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
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                    >
                      Dettaglio &rarr;
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
