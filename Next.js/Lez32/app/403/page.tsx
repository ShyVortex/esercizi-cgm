import type React from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export default async function ForbiddenPage(): Promise<React.ReactElement> {
    const headersList: ReadonlyHeaders = await headers();
    const username: string = headersList.get("x-user-username") || "Utente";
    const email: string = headersList.get("x-user-email") || "";
    const roleId: string = headersList.get("x-user-role") || "1";
    const isActiveUser: boolean = headersList.get("x-user-active") !== "false";

    const roleName: string = roleId === "3" ? "Admin" : roleId === "2" ? "Manager" : "Utente";

    const pageTitle: string = isActiveUser ? "403 - Accesso Negato" : "403 - Account Inattivo";
    const pageDesc: string = isActiveUser
        ? "Non hai i permessi necessari per accedere a questa risorsa."
        : "L'accesso a questa applicazione non è consentito agli utenti non attivi.";

    return (
        <div className="mt-8 mb-8 min-h-[70vh] flex flex-col flex-grow justify-center items-center text-center px-4">
            <div className="max-w-2xl w-full bg-gray-800/40 backdrop-blur-md rounded-2xl border border-red-500/20 shadow-2xl p-8 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 text-red-400 mb-6 border border-red-500/20 text-4xl">
                    🚫
                </div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">{pageTitle}</h1>
                <p className="text-sm text-gray-400 mb-6">{pageDesc}</p>

                <div className="bg-gray-900/60 rounded-xl p-4 mb-6 text-left border border-gray-700/50">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Dettagli Sessione</p>
                    <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Username:</span>
                            <span className="text-white font-medium">{username}</span>
                        </div>
                        {email && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Email:</span>
                                <span className="text-white font-medium">{email}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-400">Ruolo attuale:</span>
                            <span className="text-red-400 font-semibold">{roleName}</span>
                        </div>
                    </div>
                </div>

                <div className="text-gray-300 text-sm mb-8 leading-relaxed">
                    {isActiveUser ? (
                        <>
                            Questa sezione è riservata esclusivamente agli <strong>Amministratori</strong>.
                            Per accedere, effettua il login con un account provvisto di privilegi di amministrazione.
                        </>
                    ) : (
                        <>
                            Questo account è stato disattivato dall&apos;amministratore del sistema.
                            Non è possibile accedere ai servizi finché l&apos;account non viene riattivato.
                        </>
                    )}
                </div>

                <Link
                    href={isActiveUser ? "/profile" : "/login"}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all duration-150 cursor-pointer"
                >
                    {isActiveUser ? "Torna al tuo Profilo" : "Torna al Login"}
                </Link>
            </div>
        </div>
    );
}
