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
          className="inline-flex items-center text-sm font-bold text-md-primary hover:underline gap-1"
        >
          &larr; Torna al registro attività
        </Link>
      </div>

      <div className="bg-background rounded-3xl border border-md-outline-variant/30 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-md-outline-variant/20 bg-md-surface-container/20 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-md-foreground">Dettaglio Attività</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">ID record: {activity.id}</p>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${activity.status === "Completato"
              ? "bg-emerald-55/10 text-emerald-700 dark:text-emerald-450"
              : "bg-red-55/10 text-red-700 dark:text-red-450"
            }`}>
            {activity.status}
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                Tipo Attività
              </h3>
              <p className="text-lg font-bold text-md-foreground">{activity.type}</p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                Data e Ora Evento
              </h3>
              <p className="text-sm font-semibold text-md-foreground">
                {new Date(activity.timestamp).toLocaleString("it-IT", {
                  dateStyle: "full",
                  timeStyle: "short"
                })}
              </p>
            </div>
          </div>

          <div className="border-t border-md-outline-variant/20 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
              Descrizione
            </h3>
            <p className="text-sm text-md-foreground bg-md-surface-container/20 p-4 rounded-2xl border border-md-outline-variant/15 leading-relaxed font-medium">
              {activity.description}
            </p>
          </div>

          <div className="border-t border-md-outline-variant/20 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
              Utente Responsabile
            </h3>

            {user ? (
              <div className="flex items-center space-x-4 p-4 rounded-2xl border border-md-outline-variant/30 bg-md-surface-container/10 hover:bg-md-surface-container/20 transition-colors">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-md-primary-container font-bold text-md-on-primary-container">
                  {user.avatar}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-md-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate font-semibold">
                    {user.email} &bull; {user.role}
                  </p>
                </div>
                <div>
                  <Link
                    href={`/items/users/${user.id}`}
                    className="inline-flex items-center rounded-full border border-md-outline-variant/30 bg-background px-4 py-2 text-xs font-bold text-md-primary shadow-sm hover:bg-md-surface-container/20 transition-colors"
                  >
                    Profilo &rarr;
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
