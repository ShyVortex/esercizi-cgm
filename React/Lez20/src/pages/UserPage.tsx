import { useCallback, useEffect, useRef, useState } from "react";
import type { GetFPUsersResponse } from "../models/responses/user-responses";
import { PreferencesService } from "../services/preferences.service";
import type { User } from "../models/types/User";
import type { GetFPUsersRequest, SaveUserRequest } from "../models/requests/user-requests";
import { userService } from "../api/user.service";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import PaginationComponent from "../components/Pagination";
import SizeSelector from "../components/SizeSelector";
import ActiveFilter from "../components/ActiveFilter";
import CustomModal from "../components/CustomModal";
import { FilterEmptyState, TotalEmptyState } from "../components/EmptyState";
import UserList from "../components/UserList";

export default function UserPage() {
    const [users, setUsers] = useState<GetFPUsersResponse>(userService.emptyResponse);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(() => PreferencesService.loadPreferences().pageSize);
    const [filter, setFilter] = useState<string>(() => PreferencesService.loadPreferences().filter);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    // Risolve la race condition con React.StrictMode
    const fetchIdRef = useRef<number>(0);

    const style: React.CSSProperties = {
        marginTop: '40px'
    }

    // Caricamento asincrono degli utenti
    // useCallback() riesegue la funzione quando vengono modificate le variabili osservate
    const fetchUsers = useCallback(async () => {
        const currentFetchId = ++fetchIdRef.current;
        try {
            setIsFetching(true);
            setError(null);

            const request: GetFPUsersRequest = {
                page: currentPage,
                per_page: pageSize,
                filter: filter
            }

            const response: GetFPUsersResponse = await userService.getFilteredPaginatedUsers(isLoading, request);
            if (currentFetchId === fetchIdRef.current) {
                setUsers(response);
            }
        } catch (err) {
            if (currentFetchId === fetchIdRef.current) {
                setError(err instanceof Error ? err.message : 'Errore durante il caricamento degli utenti');
            }
        } finally {
            if (currentFetchId === fetchIdRef.current) {
                setIsLoading(false);
                setIsFetching(false);
            }
        }
    }, [currentPage, pageSize, filter]);

    // Effettua il fetch iniziale e ad ogni cambio di stato di paginazione/filtro
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Quando le preferenze vengono aggiornate, le salviamo in cache
    useEffect(() => {
        PreferencesService.savePreference('pageSize', pageSize);
        PreferencesService.savePreference('filter', filter);
    }, [pageSize, filter]);

    const totalPages: number = users.pages || 1;

    // Aggiorna la lista utenti con la nuova pagina
    const handleCurrentPageChange = (newPage: number): void => {
        setCurrentPage(newPage);
    }

    // Quando cambia il numero di elementi per pagina,
    // si resetta la pagina corrente a 1 per evitare errori di out-of-bounds
    const handlePageSizeChange = (newSize: number): void => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    // Quando cambia il filtro, facciamo la stessa cosa
    const handleFilterChange = (newChoice: string): void => {
        setFilter(newChoice);
        setCurrentPage(1);
    }

    // Se viene eliminato un utente, aggiorniamo e ricarichiamo
    const handleUserDelete = async (user: User): Promise<void> => {
        setIsLoading(true);
        try {
            await userService.deleteUser(user);
            await fetchUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante l\'eliminazione dell\'utente');
            setIsLoading(false);
        }
    }

    // Stato 1: Caricamento
    if (isLoading) {
        return (
            <Loader></Loader>
        );
    }

    // Stato 2: Errore
    if (error) {
        return (
            <ErrorState
                title="Si è verificato un errore"
                message={error}
                btnText="Riprova a caricare"
                onClick={fetchUsers}
            />
        );
    }

    const btnCreateStyle: string = "mt-10 pt-2 pb-2 pl-3 pr-3 w-45 bg-blue-700 hover:bg-blue-500 text-white font-medium rounded cursor-pointer transition-colors duration-150";

    // Gestione modale
    const closeModal = () => {
        setModalIsOpen(false);
        setEditingUser(null);
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setModalIsOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setModalIsOpen(true);
    };

    const handleModalSubmit = async (userData: SaveUserRequest) => {
        setIsLoading(true);
        try {
            if (editingUser) {
                // Modifica utente esistente
                await userService.updateUser(userData, 'PUT');
            } else {
                // Crea nuovo utente
                await userService.createUser(userData);
            }
            closeModal();
            await fetchUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante il salvataggio dell\'utente');
            setIsLoading(false);
        }
    };


    return (
        <>
            <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handleCurrentPageChange}
            />
            <div className="flex flex-wrap flex-row gap-8 justify-center items-center">
                <SizeSelector
                    value={pageSize}
                    onChange={handlePageSizeChange}
                />
                <ActiveFilter
                    choice={filter}
                    onChange={handleFilterChange}
                />
                <button
                    className={btnCreateStyle}
                    onClick={openCreateModal}
                >
                    Crea nuovo utente
                </button>
                <CustomModal
                    isOpen={modalIsOpen}
                    onClose={closeModal}
                    user={editingUser}
                    onSubmit={handleModalSubmit}
                />
            </div>
            <div style={style} className={isFetching ? "opacity-50 pointer-events-none transition-opacity duration-200" : "transition-opacity duration-200"}>
                {users.data != null && Array.isArray(users.data) && users.data.length === 0 ? (
                    // Nessun utente in totale
                    <TotalEmptyState />
                ) : users.data === null && users.pages === 0 ? (
                    // Nessun utente corrispondente al filtro
                    <FilterEmptyState
                        filter={filter}
                        givenStr=''
                    />
                ) : (
                    // Caricamento avvenuto con successo
                    <UserList
                        users={users.data || []}
                        onUpdate={openEditModal}
                        onDelete={handleUserDelete}
                    />
                )}
            </div>
        </>
    )
}