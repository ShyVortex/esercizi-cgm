import type React from "react";
import NavBar from "../components/NavBar";
import type { User } from "../models/types/User";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GetFPUsersResponse } from "../models/responses/user-responses";
import { authService } from "../api/auth.service";
import { userService } from "../api/user.service";
import { PreferencesService } from "../services/preferences.service";
import type { GetFPUsersRequest, SaveUserRequest } from "../models/requests/user-requests";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import PaginationComponent from "../components/Pagination";
import SizeSelector from "../components/SizeSelector";
import RoleFilter from "../components/RoleFilter";
import CustomModal from "../components/CustomModal";
import { FilterEmptyState, TotalEmptyState } from "../components/EmptyState";
import UserList from "../components/UserList";
import { AuthStorageService } from "../services/auth-storage.service";
import { useNavigate, type NavigateFunction } from "react-router";

/* eslint-disable react-hooks/rules-of-hooks */
export default function PrivatePage(): React.ReactElement {
    // Primo controllo per verificare che l'utente sia loggato e che il token sia valido
    const navigate: NavigateFunction = useNavigate();
    const loggedUser: User | undefined = AuthStorageService.getUser();

    if (!loggedUser) {
        return (
            <ErrorState
                title="HTTP Error 403 (Accesso Negato)"
                message="Non hai effettuato l'accesso. Impossibile visualizzare la pagina."
                btnText="Login"
                onClick={() => navigate('/login')}
            />
        )
    } else if (!authService.AuthVerifyUser()) {
        <ErrorState
            title="HTTP Error 401 (Non Autorizzato)"
            message="Il token di validità per la sessione è scaduto. Devi rieffettuare l'accesso."
            btnText="Login"
            onClick={() => navigate('/login')}
        />
    }

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
                limit: pageSize,
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
    }, [currentPage, pageSize, filter, isLoading]);

    // Effettua il fetch iniziale e ad ogni cambio di stato di paginazione/filtro
    useEffect(() => {
        (async () => { fetchUsers(); })();
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
                await userService.updateUser(userData, 'PATCH');
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

    let role: string;
    let roleClass: string;

    switch (loggedUser.role) {
        case 1:
            role = 'Lettore';
            roleClass = "mt-3 text-green-700 rounded";
            break;
        case 2:
            role = 'Editore';
            roleClass = "mt-3 text-yellow-700 rounded";
            break;
        case 3:
            role = 'Amministratore';
            roleClass = "mt-3 text-red-700 rounded";
            break;
        default:
            role = '';
            roleClass = "mt-3 text-gray-300 rounded";
            break;
    }


    return (
        <>
            <h3 className="mt-5">Il tuo ruolo è</h3>
            <h3 className={roleClass}>{role}</h3>
            <NavBar />
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
                <RoleFilter
                    choice={filter}
                    onChange={handleFilterChange}
                />
                {loggedUser.role === 3 ? (
                    <button
                        className={btnCreateStyle}
                        onClick={openCreateModal}
                    >
                        Crea nuovo utente
                    </button>
                )
                    : (<></>)}
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