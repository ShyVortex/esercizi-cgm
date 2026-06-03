import Link from "next/link";
import { notFound } from "next/navigation";
import data from "../../../../data/data.json";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params;

  const user = data.users.find((u) => u.id === id);

  if (!user) {
    notFound();
  }

  // Filtra le attività collegate a questo utente
  const userActivities = data.activities
    .filter((a) => a.userId === id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      {/* Link per tornare indietro */}
      <div>
        <Link
          href="/items/users"
          className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          &larr; Torna alla lista utenti
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Card Dettaglio Profilo */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 p-6 flex flex-col items-center text-center">
          <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 font-bold text-3xl text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 mb-4">
            {user.avatar}
          </span>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white">{user.name}</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{user.email}</p>

          <div className="w-full border-t border-zinc-100 dark:border-zinc-900 pt-4 mt-2 space-y-3 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">ID Utente:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">{user.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Ruolo:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">{user.role}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Stato:</span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${user.status === "Attivo"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                }`}>
                {user.status}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Registrato il:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                {new Date(user.joinedDate).toLocaleDateString("it-IT", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit"
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline Attività dell'Utente */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 p-6">
          <h3 className="text-lg font-semibold text-zinc-950 dark:text-white border-b border-zinc-100 dark:border-zinc-900 pb-3 mb-4">
            Cronologia Attività Utente
          </h3>

          {userActivities.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400 text-sm">
              Nessuna attività registrata per questo utente.
            </div>
          ) : (
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                {userActivities.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== userActivities.length - 1 ? (
                        <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-zinc-950 ${activity.status === "Completato"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                            }`}>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                              <Link href={`/items/tasks/${activity.id}`} className="hover:underline">
                                {activity.type}
                              </Link>
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                              {activity.description}
                            </p>
                          </div>
                          <div className="text-right text-xs whitespace-nowrap text-zinc-400 dark:text-zinc-500">
                            <time dateTime={activity.timestamp}>
                              {new Date(activity.timestamp).toLocaleString("it-IT", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
