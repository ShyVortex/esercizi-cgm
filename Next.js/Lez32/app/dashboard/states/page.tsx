import React from "react";
import { stateService } from "@/app/api/state.service";
import PaginationComponent from "@/app/components/Pagination";
import SizeSelector from "@/app/components/SizeSelector";
import { FilterEmptyState, TotalEmptyState } from "@/app/components/EmptyState";
import DataTable, { Column } from "@/app/components/DataTable";
import { State } from "@/models/types/Task";
import { notFound } from "next/navigation";
import { headers, cookies } from "next/headers";
import Link from "next/link";
import DeleteStateButton from "@/app/components/DeleteStateButton";
import StateModalWrapper from "@/app/components/StateModalWrapper";
import ReactSelectFilter from "@/app/components/ReactSelectFilter";

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{
        page?: string;
        per_page?: string;
        filter?: string;
        isActive?: string;
        modal?: string;
        editStateId?: string;
    }>;
}

export default async function StatesDashboardPage({ searchParams }: PageProps): Promise<React.ReactElement> {
    const params = await searchParams;
    const currentPage: number = Number(params.page) || 1;
    const pageSize: number = Number(params.per_page) || 10;
    const filter: string = params.filter || "";
    const isActive: string = params.isActive || "";

    const headersList = await headers();
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
        response = await stateService.getCachedFilteredStates(simulate, {
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

    // Colonne per la tabella degli stati (solo Admin vi accede, quindi le azioni ci sono sempre)
    const columns: Column<State>[] = [
        { key: "id", label: "State ID" },
        { key: "name", label: "Nome" },
        {
            key: "priority",
            label: "Priorità",
            render: (state) => {
                const priorityColors: Record<string, string> = {
                    none: "text-slate-400 font-medium",
                    low: "text-blue-400 font-medium",
                    medium: "text-yellow-400 font-medium",
                    high: "text-red-400 font-semibold"
                };
                const priorityLabels: Record<string, string> = {
                    none: "NESSUNA",
                    low: "BASSA",
                    medium: "MEDIA",
                    high: "ALTA"
                };
                return (
                    <span className={priorityColors[state.priority] || "text-gray-300"}>
                        {priorityLabels[state.priority] || state.priority.toUpperCase()}
                    </span>
                );
            }
        },
        {
            key: "isActive",
            label: "Attivo",
            render: (state) => (
                <span className={state.isActive ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                    {state.isActive ? "Sì" : "No"}
                </span>
            )
        },
        {
            key: "actions",
            label: "Azioni",
            headerClassName: "text-right",
            cellClassName: "text-right p-4",
            render: (state) => (
                <div className="flex justify-end items-center gap-2 whitespace-nowrap">
                    <Link
                        href={`/dashboard/states?modal=edit&editStateId=${state.id}`}
                        className="p-2 text-xs bg-gray-600 hover:bg-gray-500 text-white font-medium rounded transition-colors duration-150 inline-flex items-center justify-center h-[32px]"
                    >
                        Modifica
                    </Link>
                    <DeleteStateButton stateId={state.id} stateName={state.name} />
                </div>
            )
        }
    ];

    let stateToEdit = null;
    if (params.modal === "edit" && params.editStateId) {
        stateToEdit = await stateService.getCachedStateDetail(params.editStateId, false, token);
    }

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
                    value={isActive}
                    options={activeOptions}
                    label="Filtra per stato"
                    paramName="isActive"
                    placeholder="Tutti gli stati"
                />
                <Link
                    href="/dashboard/states?modal=create"
                    className="mt-6 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded cursor-pointer transition-colors duration-150 text-center h-[38px] inline-flex items-center justify-center whitespace-nowrap"
                >
                    Crea nuovo stato
                </Link>
            </div>
            <div className="mt-10">
                {response.data != null && Array.isArray(response.data) && response.data.length === 0 ? (
                    <TotalEmptyState title="Nessun stato presente" description="La lista degli stati è vuota." />
                ) : response.data === null && response.pages === 0 ? (
                    <FilterEmptyState
                        message="Nessun stato corrisponde ai filtri selezionati."
                    />
                ) : (
                    <DataTable
                        columns={columns}
                        data={response.data || []}
                        rowKey={(state) => state.id}
                        getRowUrl={(state) => `/dashboard/states/${state.id}`}
                    />
                )}
            </div>

            <StateModalWrapper stateToEdit={stateToEdit} />
        </>
    );
}
