import React from "react";
import { projectService } from "@/app/api/project.service";
import { apiService } from "@/app/api/api.service";
import { Project } from "@/models/types/Project";
import { Task } from "@/models/types/Task";
import DataTable, { Column } from "@/app/components/DataTable";
import ErrorTrigger from "@/app/components/ErrorTrigger";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

interface DetailProps {
    params: Promise<{ id: string }>;
}

export default async function ProjectDetail({ params }: DetailProps): Promise<React.ReactElement> {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    let project: Project | undefined;
    try {
        project = await projectService.getCachedProjectDetail(id, true, token);
    } catch (error) {
        if (error instanceof Error && error.message === "SIMULATED_NOT_FOUND") {
            notFound();
        }
        const message = error instanceof Error ? error.message : "Errore durante il caricamento del progetto";
        return <ErrorTrigger message={message} />;
    }

    if (!project) {
        notFound();
    }

    // Carica le attività collegate a questo progetto
    let projectTasks: Task[] = [];
    try {
        projectTasks = await apiService.get<Task[]>(
            `/tasks?projectId=${id}&_expand=state`,
            token ? { Authorization: `Bearer ${token}` } : undefined
        ) || [];
    } catch (e) {
        console.error("Errore nel caricamento delle attività collegate al progetto", e);
    }

    const activeText = project.isActive ? "Sì" : "No";

    // Colonne per la tabella delle attività collegate
    const columns: Column<Task>[] = [
        { key: "id", label: "Task ID" },
        { key: "title", label: "Titolo" },
        {
            key: "state",
            label: "Stato",
            render: (task) => (
                <span className="px-2 py-1 bg-gray-700/80 rounded-md text-xs font-semibold text-indigo-300 whitespace-nowrap">
                    {task.state?.name || "N/A"}
                </span>
            )
        },
        { key: "assignedTo", label: "Assegnatario (ID)" },
        { key: "start", label: "Inizio" },
        { key: "end", label: "Fine" },
        { key: "estimatedLength", label: "Stima (h)" },
        { key: "effectiveLength", label: "Effettive (h)" },
        {
            key: "isActive",
            label: "Attiva",
            render: (task) => (
                <span className={task.isActive ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                    {task.isActive ? "Sì" : "No"}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-8 text-left max-w-5xl mx-auto">
            {/* Sezione Dettagli Progetto */}
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg space-y-4">
                <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider border-b border-gray-700 pb-3">
                    Dettagli Progetto: {project.title}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                        <span className="text-gray-500 block text-xs">Project ID</span>
                        <span className="text-gray-200 font-medium text-lg">{project.id}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block text-xs">Stato Progetto</span>
                        <div className="mt-1">
                            <span className="px-2.5 py-1 bg-gray-700 rounded-md text-xs font-semibold text-indigo-300 whitespace-nowrap">
                                {project.state?.name || "N/A"}
                            </span>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <span className="text-gray-500 block text-xs">Descrizione</span>
                        <span className="text-gray-200 font-medium text-base block mt-1 leading-relaxed">
                            {project.description || "Nessuna descrizione fornita."}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-500 block text-xs">Attivo</span>
                        <span className={project.isActive ? "text-green-400 font-medium text-lg" : "text-red-400 font-medium text-lg"}>
                            {activeText}
                        </span>
                    </div>
                </div>
            </div>

            {/* Sezione Attività Associate */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                    Attività Associate al Progetto ({projectTasks.length})
                </h3>
                <DataTable
                    columns={columns}
                    data={projectTasks}
                    rowKey={(task) => task.id}
                    getRowUrl={(task) => `/dashboard/tasks/${task.id}`}
                />
            </div>
        </div>
    );
}
