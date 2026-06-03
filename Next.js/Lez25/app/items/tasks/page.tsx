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
      <div className="bg-background rounded-3xl border border-md-outline-variant/30 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-md-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-md-surface-container/20">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-md-foreground">Registro Attività</h2>
            <span className="text-xs font-bold text-md-on-primary-container bg-md-primary-container px-3 py-1 rounded-full">
              {totalActivities} Attività
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
              <tr className="border-b border-md-outline-variant/20 bg-md-surface-container/30 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                <th className="px-6 py-4">Tipo Attività</th>
                <th className="px-6 py-4">Descrizione</th>
                <th className="px-6 py-4">Utente</th>
                <th className="px-6 py-4">Stato</th>
                <th className="px-6 py-4">Data e Ora</th>
                <th className="px-6 py-4 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-md-outline-variant/15 text-sm">
              {currentActivities.map((activity) => (
                <tr key={activity.id} className="hover:bg-md-surface-container/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-md-foreground">
                    {activity.type}
                  </td>
                  <td className="px-6 py-4 text-zinc-650 dark:text-zinc-350 max-w-xs truncate font-medium">
                    {activity.description}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/items/users/${activity.userId}`}
                      className="text-md-primary font-bold hover:underline"
                    >
                      {activity.userName}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                      activity.status === "Completato"
                        ? "bg-emerald-55/10 text-emerald-700 dark:text-emerald-450"
                        : "bg-red-55/10 text-red-700 dark:text-red-450"
                    }`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-medium">
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
