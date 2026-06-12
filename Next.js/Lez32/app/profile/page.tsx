import type React from "react";
import { headers } from "next/headers";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { notFound } from "next/navigation";
import { userService } from "../api/user.service";
import { GetFPUsersResponse } from "@/models/responses/user-responses";
import ErrorTrigger from "./error-trigger";

export default async function ProfilePage(): Promise<React.ReactElement> {
    let testResult: GetFPUsersResponse | undefined | string;
    try {
        testResult = await userService.runSimulations();
    } catch (error) {
        const message = error instanceof Error ? error.message : "Errore durante il caricamento dell'utente";
        return <ErrorTrigger message={message} />;
    }

    if (!testResult) {
        notFound();
    } else if (testResult && typeof testResult === 'string' && testResult === 'Success') {
        console.log("--- SIMULAZIONI ESEGUITE CON SUCCESSO ---");
    } else {
        return <ErrorTrigger message="Errore nella finalizzazione delle simulazioni" />;
    }

    const headersList: ReadonlyHeaders = await headers();
    const userId: string = headersList.get("x-user-id") || "";
    const email: string = headersList.get("x-user-email") || "";
    const username: string = headersList.get("x-user-username") || "";
    const firstName: string = headersList.get("x-user-firstname") || "";
    const lastName: string = headersList.get("x-user-lastname") || "";
    const roleId: string = headersList.get("x-user-role") || "1";

    let roleText: string;
    let roleClass: string;

    switch (roleId) {
        case "1":
            roleText = 'Utente';
            roleClass = "font-semibold text-green-400 rounded";
            break;
        case "2":
            roleText = 'Manager';
            roleClass = "font-semibold text-yellow-400 rounded";
            break;
        case "3":
            roleText = 'Amministratore';
            roleClass = "font-semibold text-red-400 rounded";
            break;
        default:
            roleText = 'Null';
            roleClass = "font-semibold text-gray-300 rounded";
            break;
    }

    return (
        <div className="mt-10 mb-5 min-h-[70vh] flex flex-col justify-center items-center text-center px-4">
            <div className="max-w-md w-full bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-2xl p-8 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/10 text-purple-400 mb-6 border border-purple-500/20 text-4xl">
                    👤
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Profilo Utente</h1>
                <p className="text-sm text-gray-400 mb-6">Area privata protetta</p>

                <div className="bg-gray-900/60 rounded-xl p-5 text-left border border-gray-700/50 space-y-4">
                    <div>
                        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Nome Completo</span>
                        <span className="text-white font-medium text-lg">{firstName} {lastName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Username</span>
                            <span className="text-gray-200 font-medium">{username}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Ruolo</span>
                            <span className={roleClass}>{roleText}</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Indirizzo Email</span>
                        <span className="text-gray-200 font-medium">{email}</span>
                    </div>
                    <div>
                        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">ID Utente</span>
                        <span className="text-gray-400 font-mono text-xs break-all">{userId}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}