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
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Intestazione */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl font-bold tracking-tight text-md-foreground">
            Dashboard Principale
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Panoramica del sistema, degli utenti registrati e delle attività registrate in tempo reale.
          </p>
        </div>
      </div>

      {/* Grid delle Statistiche */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
        <div className="relative overflow-hidden rounded-3xl border border-md-outline-variant/30 bg-md-surface-container/50 p-6 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-md-primary-container p-3.5 text-md-primary">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Totale Utenti</p>
              <div className="flex items-baseline mt-0.5">
                <p className="text-3xl font-extrabold text-md-foreground">{data.users.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-md-outline-variant/30 bg-md-surface-container/50 p-6 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-md-primary-container p-3.5 text-md-primary">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Attività Registrate</p>
              <div className="flex items-baseline mt-0.5">
                <p className="text-3xl font-extrabold text-md-foreground">{data.activities.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sezione Liste */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Ultimi 5 Utenti */}
        <div className="rounded-3xl border border-md-outline-variant/30 bg-background p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-md-outline-variant/20 pb-4 mb-4">
            <h3 className="text-lg font-bold text-md-foreground">Ultimi Utenti Registrati</h3>
            <Link
              href="/items/users"
              className="text-sm font-bold text-md-primary hover:underline"
            >
              Vedi tutti
            </Link>
          </div>
          <div className="flow-root">
            <ul role="list" className="divide-y divide-md-outline-variant/15">
              {latestUsers.map((user) => (
                <li key={user.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-md-primary-container font-bold text-md-on-primary-container">
                        {user.avatar}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-md-foreground">
                        <Link href={`/items/users/${user.id}`} className="hover:underline">
                          {user.name}
                        </Link>
                      </p>
                      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${user.status === "Attivo"
                          ? "bg-emerald-55/10 text-emerald-700 dark:text-emerald-450"
                          : "bg-amber-55/10 text-amber-700 dark:text-amber-450"
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
        <div className="rounded-3xl border border-md-outline-variant/30 bg-background p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-md-outline-variant/20 pb-4 mb-4">
            <h3 className="text-lg font-bold text-md-foreground">Ultime Attività</h3>
            <Link
              href="/items/tasks"
              className="text-sm font-bold text-md-primary hover:underline"
            >
              Vedi tutte
            </Link>
          </div>
          <div className="flow-root">
            <ul role="list" className="divide-y divide-md-outline-variant/15">
              {latestActivities.map((activity) => (
                <li key={activity.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-md-foreground">
                        <Link href={`/items/tasks/${activity.id}`} className="hover:underline">
                          {activity.type}
                        </Link>
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{activity.description}</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        Eseguito da:{" "}
                        <Link href={`/items/users/${activity.userId}`} className="hover:underline text-md-primary font-medium">
                          {activity.userName}
                        </Link>
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${activity.status === "Completato"
                          ? "bg-emerald-55/10 text-emerald-700 dark:text-emerald-450"
                          : "bg-red-55/10 text-red-700 dark:text-red-450"
                        }`}>
                        {activity.status}
                      </span>
                      <p className="text-xs text-zinc-400 mt-1.5">
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
