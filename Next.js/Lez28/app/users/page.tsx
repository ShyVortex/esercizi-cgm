import { userService } from "../api/user.service";
import PaginationComponent from "../components/Pagination";
import SizeSelector from "../components/SizeSelector";
import ActiveFilter from "../components/ActiveFilter";
import { FilterEmptyState, TotalEmptyState } from "../components/EmptyState";
import UserList from "../components/UserList";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

interface PageProps {
    searchParams: Promise<{
        page?: string;
        per_page?: string;
        filter?: string;
    }>;
}

export default async function UserPage({ searchParams }: PageProps): Promise<React.ReactElement> {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;
    const pageSize = Number(params.per_page) || 10;
    const filter = params.filter || "";

    const headersList = await headers();
    console.log("--- REQUEST HEADERS ---");
    console.log(Object.fromEntries(headersList.entries()));
    
    const accept = headersList.get("accept") || "";
    const isRsc = accept.includes("text/x-component") || 
                  headersList.has("next-router-state-tree") || 
                  headersList.get("rsc") === "1" ||
                  headersList.has("x-nextjs-request-id") ||
                  headersList.has("x-nextjs-html-request-id");

    /* Simula l'attesa artificiale solo sui caricamenti completi (hard reload/refresh), 
    e non durante la navigazione client (RSC) */
    const simulate = !isRsc;

    const response = await userService.getFilteredPaginatedUsers(simulate, {
        page: currentPage,
        per_page: pageSize,
        filter: filter
    });

    if (!response) {
        notFound();
    }

    const totalPages = response.pages || 1;

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
                <ActiveFilter
                    value={filter}
                />
            </div>
            <div style={style}>
                {response.data != null && Array.isArray(response.data) && response.data.length === 0 ? (
                    <TotalEmptyState />
                ) : response.data === null && response.pages === 0 ? (
                    <FilterEmptyState
                        filter={filter}
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