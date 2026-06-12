import React from "react";
import { stateService } from "@/app/api/state.service";
import { State } from "@/models/types/Task";
import ErrorTrigger from "@/app/components/ErrorTrigger";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

interface DetailProps {
    params: Promise<{ id: string }>;
}

export default async function StateDetail({ params }: DetailProps): Promise<React.ReactElement> {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    let state: State | undefined;
    try {
        state = await stateService.getCachedStateDetail(id, true, token);
    } catch (error) {
        if (error instanceof Error && error.message === "SIMULATED_NOT_FOUND") {
            notFound();
        }
        const message = error instanceof Error ? error.message : "Errore durante il caricamento dello stato";
        return <ErrorTrigger message={message} />;
    }

    if (!state) {
        notFound();
    }

    const priorityColors: Record<string, string> = {
        none: "text-slate-400 font-medium",
        low: "text-blue-400 font-medium",
        medium: "text-yellow-400 font-medium",
        high: "text-red-400 font-semibold"
    };

    const priorityLabels: Record<string, string> = {
        none: "Nessuna",
        low: "Bassa",
        medium: "Media",
        high: "Alta"
    };

    const activeText = state.isActive ? "Sì" : "No";

    return (
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg space-y-4 max-w-2xl mx-auto text-left">
            <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider border-b border-gray-700 pb-3">
                Dettagli Stato: {state.name}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                    <span className="text-gray-500 block text-xs">State ID</span>
                    <span className="text-gray-200 font-medium text-lg">{state.id}</span>
                </div>
                <div>
                    <span className="text-gray-500 block text-xs">Nome Stato</span>
                    <span className="text-gray-200 font-medium text-lg">{state.name}</span>
                </div>
                <div>
                    <span className="text-gray-500 block text-xs">Priorità</span>
                    <span className={`${priorityColors[state.priority] || "text-gray-300"} text-lg uppercase`}>
                        {priorityLabels[state.priority] || state.priority}
                    </span>
                </div>
                <div>
                    <span className="text-gray-500 block text-xs">Attivo</span>
                    <span className={state.isActive ? "text-green-400 font-medium text-lg" : "text-red-400 font-medium text-lg"}>
                        {activeText}
                    </span>
                </div>
            </div>
        </div>
    );
}
