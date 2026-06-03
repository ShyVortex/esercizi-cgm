"use client";

import React, { useState } from "react";
import Link from "next/link";
import data from "../../../data/data.json";
import Pagination from "../../components/Pagination";
import SizeSelector from "../../components/SizeSelector";

export default function ActivitiesPage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const sortedActivities = [...data.activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const totalActivities = sortedActivities.length;
  const totalPages = Math.ceil(totalActivities / pageSize) || 1;

  // Riposiziona currentPage se va fuori limite dopo il cambio di pageSize
  const activePage = currentPage > totalPages ? totalPages : currentPage;

  const startIndex = (activePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Slice delle attività correnti
  const currentActivities = sortedActivities.slice(startIndex, endIndex);

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
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">Registro Attività</h2>
            <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 px-2.5 py-1 rounded-full">
              {totalActivities} Record totali
            </span>
          </div>
          <SizeSelector
            value={pageSize}
            onChange={handlePageSizeChange}
            label="Attività per pagina:"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-150 bg-zinc-50/75 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                <th className="px-6 py-3">Tipo Attività</th>
                <th className="px-6 py-3">Descrizione</th>
                <th className="px-6 py-3">Utente</th>
                <th className="px-6 py-3">Stato</th>
                <th className="px-6 py-3">Data e Ora</th>
                <th className="px-6 py-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-sm">
              {currentActivities.map((activity) => (
                <tr key={activity.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                  <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-100">
                    {activity.type}
                  </td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300 max-w-xs truncate">
                    {activity.description}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/items/users/${activity.userId}`}
                      className="text-indigo-600 hover:text-indigo-500 hover:underline dark:text-indigo-400"
                    >
                      {activity.userName}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${activity.status === "Completato"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                      : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                      }`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                    {new Date(activity.timestamp).toLocaleString("it-IT", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/items/tasks/${activity.id}`}
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
