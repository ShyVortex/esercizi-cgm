/*
  Inizia a creare in React un CRUD di un gestionale degli utenti con campi id, username, email, isActive,
  firstName, lastName e middleName (quest'ultimo facoltativo) con la pagina della lista paginata degli utenti,
  la possibilità di vedere il dettaglio di un singolo utente e la possibilità di creare un nuovo utente, facendo
  in modo che isActive venga sempre inviato a true e che middleName venga inviato solo se compilato.
  Usa sempre gli stati dell'UI (loading, empty state, error e success) e separa tutta la logica in componenti,
  service, helpers, type, ecc... mantenendo chiari nomi di variabili, funzioni e componenti in modo che solo
  leggendo quello sia possibilità capire che cosa fa quell'elemento ed evitando duplicazioni di codice.
  Aggiungi nella lista un filtro per visualizzare solo gli utenti che sono attivi, non attivi oppure tutti.
*/

import React, { useEffect, useRef, useState } from 'react';
import CustomModal from './components/CustomModal.tsx';
import './App.css';
import UserList from './components/UserList.tsx';
import PaginationComponent from "./components/Pagination.tsx";
import { UserService } from "./services/UserService.ts";
import { PreferencesService } from './services/PreferencesService.ts';
import SizeSelector from "./components/SizeSelector.tsx";
import ActiveFilter from './components/ActiveFilter.tsx';
import type { User } from './types/User.ts';
import Loader from './components/Loader.tsx';
import ErrorState from './components/ErrorState.tsx';
import { FilterEmptyState, TotalEmptyState } from './components/EmptyState.tsx';



function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(() => PreferencesService.loadPreferences().pageSize);
  const [filter, setFilter] = useState<string>(() => PreferencesService.loadPreferences().filter);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Risolve la race condition con React.StrictMode
  const fetchIdRef = useRef<number>(0);

  const style: React.CSSProperties = {
    marginTop: '40px'
  }

  // Caricamento asincrono dei task
  const fetchUsers = async () => {
    const currentFetchId = ++fetchIdRef.current;
    try {
      setIsLoading(true);
      setError(null);
      const data = await UserService.loadUsers(true);
      if (currentFetchId === fetchIdRef.current) {
        setUsers(data);
      }
    } catch (err) {
      if (currentFetchId === fetchIdRef.current) {
        setError(err instanceof Error ? err.message : 'Errore durante il caricamento degli utenti');
      }
    } finally {
      if (currentFetchId === fetchIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  /* Hook al mount: questo useEffect() si attiva una sola volta al caricamento della pagina
     perché non osserva il cambiamento di stato di nessuna variabile */
  useEffect(() => {
    (async () => {
      fetchUsers();
    })();
  }, []);

  // Quando le attività o le preferenze vengono aggiornate, le salviamo in cache
  useEffect(() => {
    // Salviamo gli utenti solo se non siamo in fase di caricamento e non ci sono errori e la lista non è vuota
    if (!isLoading && !error && users.length > 0) {
      UserService.saveUsers(users);
    }
    PreferencesService.savePreference('pageSize', pageSize);
    PreferencesService.savePreference('filter', filter);
  }, [users, pageSize, filter, isLoading, error]);

  const filteredUsers = users.filter(user => {
    if (filter === 'active') return user.isActive === true;
    if (filter === 'inactive') return user.isActive === false;

    return true; // Se il filtro è vuoto, le teniamo tutte
  });

  const totalPages: number = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTasks = filteredUsers.slice(startIndex, endIndex);

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
  const handleUserDelete = (user: User): void => {
    UserService.deleteUser(user);
    fetchUsers();
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

  const handleModalSubmit = (userData: Omit<User, 'id' | 'isActive'>) => {
    if (editingUser) {
      // Modifica utente esistente
      setUsers(prevUsers => prevUsers.map(u =>
        u.id === editingUser.id
          ? { ...u, ...userData, middleName: userData.middleName || undefined }
          : u
      ));
    } else {
      // Crea nuovo utente
      const nextId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      const newUser: User = {
        id: nextId,
        ...userData,
        isActive: true, // "isActive viene sempre inviato a true"
      };
      setUsers(prevUsers => [...prevUsers, newUser]);
    }
    closeModal();
  };


  return (
    <>
      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page: number): void => setCurrentPage(page)}
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
      <div style={style}>
        {users.length === 0 ? (
          // Nessun utente in totale
          <TotalEmptyState />
        ) : filteredUsers.length === 0 ? (
          // Nessun utente corrispondente al filtro
          <FilterEmptyState
            filter={filter}
            givenStr=''
          />
        ) : (
          // Caricamento avvenuto con successo
          <UserList
            users={paginatedTasks}
            onUpdate={openEditModal}
            onDelete={handleUserDelete}
          />
        )}
      </div>
    </>
  )
}

export default App
