import Link from "next/link";
import data from "../data/data.json";

export default function Home() {
  // Ultimi 5 utenti (ordinati per data di registrazione decrescente)
  const latestUsers = [...data.users]
    .sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime())
    .slice(0, 5);

  // Ultime 5 attività (ordinate per timestamp decrescente)
  const latestActivities = [...data.activities]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Intestazione */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl font-bold leading-7 text-zinc-950 dark:text-white sm:truncate sm:text-4xl sm:tracking-tight">
            Dashboard Principale
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Panoramica del sistema, degli utenti registrati e delle attività registrate in tempo reale.
          </p>
        </div>
      </div>

      {/* Grid delle Statistiche */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
        <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <dt>
            <div className="absolute rounded-lg bg-indigo-600 p-3 text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
            <p className="ml-16 truncate text-sm font-medium text-zinc-500 dark:text-zinc-400">Totale Utenti</p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-2">
            <p className="text-2xl font-semibold text-zinc-950 dark:text-white">{data.users.length}</p>
          </dd>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <dt>
            <div className="absolute rounded-lg bg-indigo-600 p-3 text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
              </svg>
            </div>
            <p className="ml-16 truncate text-sm font-medium text-zinc-500 dark:text-zinc-400">Attività Registrate</p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-2">
            <p className="text-2xl font-semibold text-zinc-950 dark:text-white">{data.activities.length}</p>
          </dd>
        </div>
      </div>

      {/* Sezione Liste */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Ultimi 5 Utenti */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4 mb-4">
            <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">Ultimi Utenti Registrati</h3>
            <Link
              href="/items/users"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Vedi tutti
            </Link>
          </div>
          <div className="flow-root">
            <ul role="list" className="-my-5 divide-y divide-zinc-100 dark:divide-zinc-900">
              {latestUsers.map((user) => (
                <li key={user.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        {user.avatar}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-950 dark:text-white">
                        <Link href={`/items/users/${user.id}`} className="hover:underline">
                          {user.name}
                        </Link>
                      </p>
                      <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">{user.email}</p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.status === "Attivo"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                        }`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Ultime 5 Attività */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4 mb-4">
            <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">Ultime Attività</h3>
            <Link
              href="/items/tasks"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Vedi tutte
            </Link>
          </div>
          <div className="flow-root">
            <ul role="list" className="-my-5 divide-y divide-zinc-100 dark:divide-zinc-900">
              {latestActivities.map((activity) => (
                <li key={activity.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
                        <Link href={`/items/tasks/${activity.id}`} className="hover:underline">
                          {activity.type}
                        </Link>
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{activity.description}</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        Eseguito da:{" "}
                        <Link href={`/items/users/${activity.userId}`} className="hover:underline text-indigo-600 dark:text-indigo-400">
                          {activity.userName}
                        </Link>
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${activity.status === "Completato"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                        }`}>
                        {activity.status}
                      </span>
                      <p className="text-xs text-zinc-400 mt-1">
                        {new Date(activity.timestamp).toLocaleTimeString("it-IT", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
