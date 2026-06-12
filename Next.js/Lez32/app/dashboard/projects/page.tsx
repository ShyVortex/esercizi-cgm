import React from "react";
import { projectService } from "@/app/api/project.service";
import PaginationComponent from "@/app/components/Pagination";
import SizeSelector from "@/app/components/SizeSelector";
import { FilterEmptyState, TotalEmptyState } from "@/app/components/EmptyState";
import DataTable, { Column } from "@/app/components/DataTable";
import { Project } from "@/models/types/Project";
import { notFound } from "next/navigation";
import { headers, cookies } from "next/headers";
import Link from "next/link";
import DeleteProjectButton from "@/app/components/DeleteProjectButton";
import ProjectModalWrapper from "@/app/components/ProjectModalWrapper";
import ReactSelectFilter from "@/app/components/ReactSelectFilter";

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{
        page?: string;
        per_page?: string;
        filter?: string;
        isActive?: string;
        modal?: string;
        editProjectId?: string;
    }>;
}

export default async function ProjectsDashboardPage({ searchParams }: PageProps): Promise<React.ReactElement> {
    const params = await searchParams;
    const currentPage: number = Number(params.page) || 1;
    const pageSize: number = Number(params.per_page) || 10;
    const filter: string = params.filter || "";
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
        response = await projectService.getCachedFilteredProjects(simulate, {
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

    // Colonne per la tabella dei progetti
    const columns: Column<Project>[] = [
        { key: "id", label: "Project ID" },
        { key: "title", label: "Titolo" },
        { key: "description", label: "Descrizione" },
        {
            key: "state",
            label: "Stato",
            render: (project) => (
                <span className="px-2 py-1 bg-gray-700/80 rounded-md text-xs font-semibold text-indigo-300 whitespace-nowrap">
                    {project.state?.name || "N/A"}
                </span>
            )
        },
        {
            key: "isActive",
            label: "Attivo",
            render: (project) => (
                <span className={project.isActive ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                    {project.isActive ? "Sì" : "No"}
                </span>
            )
        }
    ];

    if (isManagerOrAdmin) {
        columns.push({
            key: "actions",
            label: "Azioni",
            headerClassName: "text-right",
            cellClassName: "text-right p-4",
            render: (project) => (
                <div className="flex justify-end items-center gap-2 whitespace-nowrap">
                    <Link
                        href={`/dashboard/projects?modal=edit&editProjectId=${project.id}`}
                        className="p-2 text-xs bg-gray-600 hover:bg-gray-500 text-white font-medium rounded transition-colors duration-150 inline-flex items-center justify-center h-[32px]"
                    >
                        Modifica
                    </Link>
                    <DeleteProjectButton projectId={project.id} projectTitle={project.title} />
                </div>
            )
        });
    }

    let projectToEdit = null;
    if (params.modal === "edit" && params.editProjectId) {
        projectToEdit = await projectService.getCachedProjectDetail(params.editProjectId, false, token);
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
                {isManagerOrAdmin && (
                    <Link
                        href="/dashboard/projects?modal=create"
                        className="mt-6 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded cursor-pointer transition-colors duration-150 text-center h-[38px] inline-flex items-center justify-center whitespace-nowrap"
                    >
                        Crea nuovo progetto
                    </Link>
                )}
            </div>
            <div className="mt-10">
                {response.data != null && Array.isArray(response.data) && response.data.length === 0 ? (
                    <TotalEmptyState title="Nessun progetto presente" description="La lista dei progetti è vuota." />
                ) : response.data === null && response.pages === 0 ? (
                    <FilterEmptyState
                        message="Nessun progetto corrisponde ai filtri selezionati."
                    />
                ) : (
                    <DataTable
                        columns={columns}
                        data={response.data || []}
                        rowKey={(project) => project.id}
                        getRowUrl={(project) => `/dashboard/projects/${project.id}`}
                    />
                )}
            </div>

            <ProjectModalWrapper projectToEdit={projectToEdit} />
        </>
    );
}
