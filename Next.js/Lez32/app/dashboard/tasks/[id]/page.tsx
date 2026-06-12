import React from "react";
import { taskService } from "@/app/api/task.service";
import { userService } from "@/app/api/user.service";
import { projectService } from "@/app/api/project.service";
import { Task } from "@/models/types/Task";
import ErrorTrigger from "@/app/components/ErrorTrigger";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";

interface DetailProps {
    params: Promise<{ id: string }>;
}

export default async function TaskDetail({ params }: DetailProps): Promise<React.ReactElement> {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    let task: Task | undefined;
    try {
        task = await taskService.getCachedTaskDetail(id, true, token);
    } catch (error) {
        if (error instanceof Error && error.message === "SIMULATED_NOT_FOUND") {
            notFound();
        }
        const message = error instanceof Error ? error.message : "Errore durante il caricamento dell'attività";
        return <ErrorTrigger message={message} />;
    }

    if (!task) {
        notFound();
    }

    // Carica informazioni collegate (assegnatario e progetto) in parallelo
    let assigneeName = "Non assegnato";
    let projectName = "N/A";

    try {
        const [userRes, projectRes] = await Promise.all([
            task.assignedTo ? userService.getCachedUserDetail(String(task.assignedTo), false, token).catch(() => undefined) : undefined,
            task.projectId ? projectService.getCachedProjectDetail(String(task.projectId), false, token).catch(() => undefined) : undefined
        ]);
        if (userRes) {
            assigneeName = `${userRes.firstName} ${userRes.lastName}`;
        }
        if (projectRes) {
            projectName = projectRes.title;
        }
    } catch (e) {
        console.error("Errore nel caricamento delle relazioni del task", e);
    }

    const activeText = task.isActive ? "Sì" : "No";

    return (
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg space-y-4 max-w-2xl mx-auto text-left">
            <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider border-b border-gray-700 pb-3">
                Dettagli Attività: {task.title}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                    <span className="text-gray-500 block text-xs">Task ID</span>
                    <span className="text-gray-200 font-medium text-lg">{task.id}</span>
                </div>
                <div>
                    <span className="text-gray-500 block text-xs">Stato</span>
                    <div className="mt-1">
                        <span className="px-2.5 py-1 bg-gray-700 rounded-md text-xs font-semibold text-indigo-300 whitespace-nowrap">
                            {task.state?.name || "N/A"}
                        </span>
                    </div>
                </div>
                <div>
                    <span className="text-gray-500 block text-xs">Progetto</span>
                    {task.projectId ? (
                        <Link href={`/dashboard/projects/${task.projectId}`} className="text-blue-400 hover:text-blue-300 hover:underline font-medium text-lg">
                            {projectName}
                        </Link>
                    ) : (
                        <span className="text-gray-400 text-lg">N/A</span>
                    )}
                </div>
                <div>
                    <span className="text-gray-500 block text-xs">Assegnatario</span>
                    {task.assignedTo ? (
                        <Link href={`/dashboard/users/${task.assignedTo}`} className="text-blue-400 hover:text-blue-300 hover:underline font-medium text-lg">
                            {assigneeName} (ID: {task.assignedTo})
                        </Link>
                    ) : (
                        <span className="text-gray-400 text-lg">Non assegnato</span>
                    )}
                </div>
                <div>
                    <span className="text-gray-500 block text-xs">Data Inizio</span>
                    <span className="text-gray-200 font-medium text-lg">
                        {task.start ? new Date(task.start).toLocaleDateString("it-IT") : "N/A"}
                    </span>
                </div>
                <div>
                    <span className="text-gray-500 block text-xs">Data Fine</span>
                    <span className="text-gray-200 font-medium text-lg">
                        {task.end ? new Date(task.end).toLocaleDateString("it-IT") : "N/A"}
                    </span>
                </div>
                <div>
                    <span className="text-gray-500 block text-xs">Stima Ore</span>
                    <span className="text-gray-200 font-medium text-lg">{task.estimatedLength} h</span>
                </div>
                <div>
                    <span className="text-gray-500 block text-xs">Ore Effettive</span>
                    <span className="text-gray-200 font-medium text-lg">{task.effectiveLength !== undefined ? `${task.effectiveLength} h` : "N/A"}</span>
                </div>
                <div>
                    <span className="text-gray-500 block text-xs">Attivo</span>
                    <span className={task.isActive ? "text-green-400 font-medium text-lg" : "text-red-400 font-medium text-lg"}>
                        {activeText}
                    </span>
                </div>
            </div>
        </div>
    );
}
