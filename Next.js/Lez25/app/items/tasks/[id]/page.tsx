import Link from "next/link";
import { notFound } from "next/navigation";
import data from "../../../../data/data.json";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ActivityDetailPage({ params }: PageProps) {
  const { id } = await params;

  const activity = data.activities.find((a) => a.id === id);

  if (!activity) {
    notFound();
  }

  // Trova l'utente associato per avere ulteriori informazioni
  const user = data.users.find((u) => u.id === activity.userId);

  return (
    <div className="space-y-6">
      {/* Link per tornare indietro */}
      <div>
        <Link
          href="/items/tasks"
          className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          &larr; Torna al registro attività
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-zinc-950 dark:text-white">Dettaglio Attività</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Identificativo record: {activity.id}</p>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${activity.status === "Completato"
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
            : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
            }`}>
            {activity.status}
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                Tipo Attività
              </h3>
              <p className="text-lg font-bold text-zinc-950 dark:text-white">{activity.type}</p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                Data e Ora Evento
              </h3>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {new Date(activity.timestamp).toLocaleString("it-IT", {
                  dateStyle: "full",
                  timeStyle: "medium"
                })}
              </p>
            </div>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-900 pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              Descrizione
            </h3>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-lg border border-zinc-100 dark:border-zinc-900 leading-relaxed">
              {activity.description}
            </p>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-900 pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
              Utente Responsabile
            </h3>

            {user ? (
              <div className="flex items-center space-x-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                  {user.avatar}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-950 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    {user.email} &bull; {user.role}
                  </p>
                </div>
                <div>
                  <Link
                    href={`/items/users/${user.id}`}
                    className="inline-flex items-center rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Profilo Utente &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{activity.userName} (Utente eliminato)</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
