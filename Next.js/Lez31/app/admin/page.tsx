import { userService } from "../api/user.service";
import PaginationComponent from "../components/Pagination";
import SizeSelector from "../components/SizeSelector";
import RoleFilter from "../components/RoleFilter";
import ActiveFilter from "../components/ActiveFilter";
import { FilterEmptyState, TotalEmptyState } from "../components/EmptyState";
import UserList from "../components/UserList";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import Link from "next/link";
import AdminModalWrapper from "../components/AdminModalWrapper";

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

export default async function AdminPage({ searchParams }: PageProps): Promise<React.ReactElement> {
    const params = await searchParams;
    const currentPage: number = Number(params.page) || 1;
    const pageSize: number = Number(params.per_page) || 10;
    const filter: string = params.filter || "";
    const isActive: string = params.isActive || "";
    const modal: string = params.modal || "";
    const editUserId: string = params.editUserId || "";

    const headersList: ReadonlyHeaders = await headers();
    console.log("--- REQUEST HEADERS ---");
    console.log(Object.fromEntries(headersList.entries()));

    const accept: string = headersList.get("accept") || "";
    const isRsc: boolean = accept.includes("text/x-component") ||
        headersList.has("next-router-state-tree") ||
        headersList.get("rsc") === "1" ||
        headersList.has("x-nextjs-request-id") ||
        headersList.has("x-nextjs-html-request-id");

    /* Simula l'attesa artificiale solo sui caricamenti completi (hard reload/refresh), 
    e non durante la navigazione client (RSC) */
    const simulate: boolean = !isRsc;

    const response = await userService.getCachedFilteredUsers(simulate, {
        page: currentPage,
        limit: pageSize,
        filter: filter,
        isActive: isActive
    });

    if (!response) {
        notFound();
    }

    const totalPages: number = response.pages || 1;

    const style: React.CSSProperties = {
        marginTop: '40px'
    };

    // Recupera i dati dell'utente da modificare se richiesto
    let userToEdit = null;
    if (modal === "edit" && editUserId) {
        const fetchedUser = await userService.getCachedUserDetail(editUserId);
        userToEdit = fetchedUser || null;
    }

    return (
        <>
            <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
            />
            <div className="flex flex-wrap flex-row gap-8 justify-center items-center">
                <SizeSelector
                    value={pageSize}
                />
                <RoleFilter
                    value={filter}
                />
                <ActiveFilter
                    value={isActive}
                />
                <Link
                    href="/admin?modal=create"
                    className="mt-10 pt-2 pb-2 pl-3 pr-3 w-45 bg-blue-700 hover:bg-blue-600 text-white font-medium rounded cursor-pointer transition-colors duration-150 inline-block text-center"
                >
                    Crea nuovo utente
                </Link>
            </div>
            <div style={style}>
                {response.data != null && Array.isArray(response.data) && response.data.length === 0 ? (
                    <TotalEmptyState />
                ) : response.data === null && response.pages === 0 ? (
                    <FilterEmptyState
                        filter={filter || isActive}
                        givenStr=''
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