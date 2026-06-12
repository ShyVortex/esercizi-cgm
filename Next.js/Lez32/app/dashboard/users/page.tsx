import { userService } from "@/app/api/user.service";
import PaginationComponent from "@/app/components/Pagination";
import SizeSelector from "@/app/components/SizeSelector";
import { FilterEmptyState, TotalEmptyState } from "@/app/components/EmptyState";
import UserList from "@/app/components/UserList";
import { notFound } from "next/navigation";
import { headers, cookies } from "next/headers";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import Link from "next/link";
import AdminModalWrapper from "@/app/components/AdminModalWrapper";
import ReactSelectFilter from "@/app/components/ReactSelectFilter";

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{
        page?: string;
        per_page?: string;
        filter?: string;
        isActive?: string;
        modal?: string;
        editUserId?: string;
    }>;
}

export default async function UsersDashboardPage({ searchParams }: PageProps): Promise<React.ReactElement> {
    const params = await searchParams;
    const currentPage: number = Number(params.page) || 1;
    const pageSize: number = Number(params.per_page) || 10;
    const filter: string = params.filter || "";
    const isActive: string = params.isActive || "";
    const modal: string = params.modal || "";
    const editUserId: string = params.editUserId || "";

    const headersList: ReadonlyHeaders = await headers();
    const accept: string = headersList.get("accept") || "";
    const isRsc: boolean = accept.includes("text/x-component") ||
        headersList.has("next-router-state-tree") ||
        headersList.get("rsc") === "1" ||
        headersList.has("x-nextjs-request-id") ||
        headersList.has("x-nextjs-html-request-id");

    const simulate: boolean = !isRsc;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    let response;
    try {
        response = await userService.getCachedFilteredUsers(simulate, {
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

    // Recupera i dati dell'utente da modificare se richiesto
    let userToEdit = null;
    if (modal === "edit" && editUserId) {
        const fetchedUser = await userService.getCachedUserDetail(editUserId, false, token);
        userToEdit = fetchedUser || null;
    }

    const roleOptions = [
        { value: "user", label: "Utenti" },
        { value: "manager", label: "Managers" },
        { value: "admin", label: "Amministratori" }
    ];

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
                    options={roleOptions}
                    label="Filtra per ruolo"
                    paramName="filter"
                    placeholder="Tutti i ruoli"
                />
                <ReactSelectFilter
                    value={isActive}
                    options={activeOptions}
                    label="Filtra per stato"
                    paramName="isActive"
                    placeholder="Tutti gli stati"
                />
                <Link
                    href="/dashboard/users?modal=create"
                    className="mt-6 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded cursor-pointer transition-colors duration-150 text-center h-[38px] inline-flex items-center justify-center whitespace-nowrap"
                >
                    Crea nuovo utente
                </Link>
            </div>
            <div className="mt-10">
                {response.data != null && Array.isArray(response.data) && response.data.length === 0 ? (
                    <TotalEmptyState title="Nessun utente presente" description="La lista degli utenti è vuota." />
                ) : response.data === null && response.pages === 0 ? (
                    <FilterEmptyState
                        message="Nessun utente corrisponde ai filtri selezionati."
                    />
                ) : (
                    <UserList
                        users={response.data || []}
                    />
                )}
            </div>

            <AdminModalWrapper userToEdit={userToEdit} />
        </>
    );
}
