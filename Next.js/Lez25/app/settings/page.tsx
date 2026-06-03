export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Impostazioni Sistema
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Gestisci le preferenze generali, le notifiche e le impostazioni {"dell'applicazione"}.
        </p>
      </div>

      <div className="space-y-6">
        {/* Sezione Preferenze Generali */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 p-6">
          <h3 className="text-lg font-semibold text-zinc-950 dark:text-white border-b border-zinc-100 dark:border-zinc-900 pb-3 mb-4">
            Preferenze Generali
          </h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <label className="text-sm font-semibold text-zinc-900 dark:text-white">Lingua Portale</label>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Seleziona la lingua di visualizzazione per la console.</p>
              </div>
              <select className="block w-full sm:w-48 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                <option>Italiano (IT)</option>
                <option>English (US)</option>
                <option>Español (ES)</option>
              </select>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <label className="text-sm font-semibold text-zinc-900 dark:text-white">Fuso Orario</label>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Imposta il fuso orario di visualizzazione per i log.</p>
              </div>
              <select className="block w-full sm:w-48 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                <option>Rome (GMT+2)</option>
                <option>London (GMT+1)</option>
                <option>New York (GMT-4)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sezione Notifiche */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 p-6">
          <h3 className="text-lg font-semibold text-zinc-950 dark:text-white border-b border-zinc-100 dark:border-zinc-900 pb-3 mb-4">
            Notifiche email
          </h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="notif_reg"
                  name="notif_reg"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 dark:border-zinc-800 dark:bg-zinc-900"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="notif_reg" className="font-medium text-zinc-900 dark:text-white">
                  Registrazione nuovi utenti
                </label>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Ricevi {"un'email"} ogni volta che un nuovo utente completa la registrazione.</p>
              </div>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4 flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="notif_sec"
                  name="notif_sec"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 dark:border-zinc-800 dark:bg-zinc-900"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="notif_sec" className="font-medium text-zinc-900 dark:text-white">
                  Avvisi di sicurezza
                </label>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Notifiche per tentativi di accesso falliti o attività insolite.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sezione Sistema */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 p-6">
          <h3 className="text-lg font-semibold text-zinc-950 dark:text-white border-b border-zinc-100 dark:border-zinc-900 pb-3 mb-4">
            Dati Applicazione
          </h3>
          <div>
            <div className="rounded-lg bg-zinc-50 p-4 border border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-800 flex items-center justify-between">
              <div className="text-sm">
                <p className="font-semibold text-zinc-900 dark:text-white">Stato Origine Dati</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Attualmente configurato con database JSON locale statico.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                JSON Locale
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
