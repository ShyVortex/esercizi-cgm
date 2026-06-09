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

interface PageProps {
    searchParams: Promise<{
        page?: string;
        per_page?: string;
        filter?: string;
        isActive?: string;
    }>;
}

export default async function AdminPage({ searchParams }: PageProps): Promise<React.ReactElement> {
    const params = await searchParams;
    const currentPage: number = Number(params.page) || 1;
    const pageSize: number = Number(params.per_page) || 10;
    const filter: string = params.filter || "";
    const isActive: string = params.isActive || "";

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

    const response = await userService.getFilteredPaginatedUsers(simulate, {
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
        </>
    );
}