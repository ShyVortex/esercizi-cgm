import React from "react";
import { taskService } from "@/app/api/task.service";
import PaginationComponent from "@/app/components/Pagination";
import SizeSelector from "@/app/components/SizeSelector";
import { FilterEmptyState, TotalEmptyState } from "@/app/components/EmptyState";
import DataTable, { Column } from "@/app/components/DataTable";
import { Task } from "@/models/types/Task";
import { notFound } from "next/navigation";
import { headers, cookies } from "next/headers";
import Link from "next/link";
import DeleteTaskButton from "@/app/components/DeleteTaskButton";
import TaskModalWrapper from "@/app/components/TaskModalWrapper";
import ReactSelectFilter from "@/app/components/ReactSelectFilter";
import { apiService } from "@/app/api/api.service";
import { State } from "@/models/types/Task";

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{
        page?: string;
        per_page?: string;
        filter?: string;
        isActive?: string;
        assignedTo?: string;
        modal?: string;
        editTaskId?: string;
    }>;
}

export default async function TasksDashboardPage({ searchParams }: PageProps): Promise<React.ReactElement> {
    const params = await searchParams;
    const currentPage: number = Number(params.page) || 1;
    const pageSize: number = Number(params.per_page) || 10;
    const filter: string = params.filter || ""; // stateId
    const isActive: string = params.isActive || "";

    const headersList = await headers();
    const roleId = headersList.get("x-user-role") || "1";
    const isManagerOrAdmin = roleId === "2" || roleId === "3";

    const accept = headersList.get("accept") || "";
    const isRsc = accept.includes("text/x-component") ||
        headersList.has("next-router-state-tree") ||
        headersList.get("rsc") === "1" ||
        headersList.has("x-nextjs-request-id") ||
        headersList.has("x-nextjs-html-request-id");

    const simulate = !isRsc;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    let response;
    try {
        response = await taskService.getCachedFilteredTasks(simulate, {
            page: currentPage,
            limit: pageSize,
            filter: filter,
            isActive: isActive
        }, token);
    } catch (error) {
        if (error instanceof Error && error.message === "SIMULATED_NOT_FOUND") {
            notFound();
        }
        throw error;
    }

    if (!response) {
        notFound();
    }

    const totalPages: number = response.pages || 1;

    // Colonne per la tabella dei task
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
            label: "Attivo",
            render: (task) => (
                <span className={task.isActive ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                    {task.isActive ? "Sì" : "No"}
                </span>
            )
        }
    ];

    // Se l'utente è manager o admin, aggiungiamo la colonna delle azioni
    if (isManagerOrAdmin) {
        columns.push({
            key: "actions",
            label: "Azioni",
            headerClassName: "text-right",
            cellClassName: "text-right p-4",
            render: (task) => (
                <div className="flex justify-end items-center gap-2 whitespace-nowrap">
                    <Link
                        href={`/dashboard/tasks?modal=edit&editTaskId=${task.id}`}
                        className="p-2 text-xs bg-gray-600 hover:bg-gray-500 text-white font-medium rounded transition-colors duration-150 inline-flex items-center justify-center h-[32px]"
                    >
                        Modifica
                    </Link>
                    <DeleteTaskButton taskId={task.id} taskTitle={task.title} />
                </div>
            )
        });
    }

    // Recupera i dati della task da modificare se richiesto
    let taskToEdit = null;
    if (params.modal === "edit" && params.editTaskId) {
        taskToEdit = await taskService.getCachedTaskDetail(params.editTaskId, false, token);
    }

    // Carica stati per il filtro
    let states: State[] = [];
    try {
        states = await apiService.get<State[]>(
            "/states?isActive=true",
            token ? { Authorization: `Bearer ${token}` } : undefined
        ) || [];
    } catch (e) {
        console.error("Errore nel caricamento degli stati per i filtri", e);
    }

    const stateOptions = states.map(s => ({ value: String(s.id), label: s.name }));
    const activeOptions = [
        { value: "active", label: "Attivi" },
        { value: "inactive", label: "Non attivi" }
    ];

    return (
        <>
            <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
            />
            <div className="flex flex-wrap flex-row gap-8 justify-center items-end">
                <SizeSelector
                    value={pageSize}
                />
                <ReactSelectFilter
                    value={filter}
                    options={stateOptions}
                    label="Filtra per stato attività"
                    paramName="filter"
                    placeholder="Tutti gli stati"
                />
                <ReactSelectFilter
                    value={isActive}
                    options={activeOptions}
                    label="Filtra per stato"
                    paramName="isActive"
                    placeholder="Attivo/Inattivo"
                />
                {isManagerOrAdmin && (
                    <Link
                        href="/dashboard/tasks?modal=create"
                        className="mt-6 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded cursor-pointer transition-colors duration-150 text-center h-[38px] inline-flex items-center justify-center whitespace-nowrap"
                    >
                        Crea nuova attività
                    </Link>
                )}
            </div>
            <div className="mt-10">
                {response.data != null && Array.isArray(response.data) && response.data.length === 0 ? (
                    <TotalEmptyState title="Nessuna attività presente" description="La lista delle attività è vuota." />
                ) : response.data === null && response.pages === 0 ? (
                    <FilterEmptyState
                        message="Nessuna attività corrisponde ai filtri selezionati."
                    />
                ) : (
                    <DataTable
                        columns={columns}
                        data={response.data || []}
                        rowKey={(task) => task.id}
                        getRowUrl={(task) => `/dashboard/tasks/${task.id}`}
                    />
                )}
            </div>

            <TaskModalWrapper taskToEdit={taskToEdit} />
        </>
    );
}

