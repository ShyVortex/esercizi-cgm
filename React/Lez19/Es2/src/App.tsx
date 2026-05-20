/*
  Costrusci una lista degli utenti in React che chiami un endpoint mockato (nessuna chiamata reale all'API)
  con un ritardo che va da 1000 a 3000 ms con la possibilità del 5% che la chiamata fallisca e 5% che la lista sia vuota.
  Usare gli stati dell'UI visti in precedenza (non caricato, in caricamento, empty state, success ed error) per mostrare all'utente
  l'avanzamento del caricamento. Separa fetch, mapping, validation, caching e rendering, usando sempre nomi parlanti
  per variabili e funzioni. Fare attenzione a non restituire dati tecnici all'utente ma solo messaggi chiari in base
  allo stato in cui si trova la richiesta. Non usare librerie esterne o caching avanzato, il primo caricamento deve
  leggere i dati dal fetch mockato mentre quelli successivi deve leggerli dalla cache, mostrando in modo semplice
  quando viene usato uno e quando viene usato l'altro, facendo in modo che il dato rimanga coerente sia quando lo
  legge dal primo che dal secondo. La chiave delle cache deve essere chiara.

  In caso di più richieste mantieni sempre l'ultimo risultato più recente e prevedi dei casi in cui sia invalidata,
  ad esempio dopo 2 minuti e in quel caso rileggila dalla fetch mockata.
*/

import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import './App.css';
import UserList from './components/UserList.tsx';
import PaginationComponent from "./components/Pagination.tsx";
import { UserService } from "./services/UserService.ts";
import { PreferencesService } from './services/PreferencesService.ts';
import SizeSelector from "./components/SizeSelector.tsx";
import RoleFilter from './components/RoleFilter.tsx';
import type { User } from './types/User.ts';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(() => PreferencesService.loadPreferences().pageSize);
  const [filter, setFilter] = useState<string>(() => PreferencesService.loadPreferences().filter);

  // Risolve la race condition con React.StrictMode
  const fetchIdRef = useRef<number>(0);

  const style: React.CSSProperties = {
    marginTop: '40px'
  }

  // Caricamento asincrono dei task
  const fetchUsers = async () => {
    if (!PreferencesService.loadPreferences().skipLoading)
      PreferencesService.savePreference('skipLoading', true);

    const currentFetchId = ++fetchIdRef.current;
    try {
      setIsLoading(true);
      setError(null);
      const data = await UserService.loadUsers();
      if (currentFetchId === fetchIdRef.current) {
        setUsers(data);
        setIsLoaded(true);
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
      const skipLoading: boolean = PreferencesService.loadPreferences().skipLoading;
      if (skipLoading)
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
    if (filter === 'User') return user.role === 'User';
    if (filter === 'Moderator') return user.role === 'Moderator';
    if (filter === 'Admin') return user.role === 'Admin';

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
    UserService.deleteUser(users, user);
    fetchUsers();
  }

  // Stato 0: Non caricato
  if (!isLoaded && !isLoading && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 bg-gray-800/40 rounded-xl border border-gray-700/50 backdrop-blur-sm shadow-xl text-center">
        <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-2xl font-bold">💤</div>
        <div className="space-y-2">
          <h3 className="text-gray-300 font-semibold text-lg">Dati non caricati</h3>
          <p className="text-gray-400 text-sm max-w-sm">La lista degli utenti non è ancora stata caricata.</p>
        </div>
        <button
          onClick={fetchUsers}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-all shadow-lg active:scale-95 cursor-pointer"
        >
          Carica utenti
        </button>
      </div>
    );
  }

  // Stato 1: Caricamento
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 bg-gray-800/50 rounded-xl border border-gray-700/50 backdrop-blur-sm shadow-xl">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-gray-300 font-medium animate-pulse text-lg">Caricamento degli utenti in corso...</p>
      </div>
    );
  }

  // Stato 2: Errore
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 bg-red-950/20 rounded-xl border border-red-900/30 shadow-xl text-center">
        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-400 text-2xl font-bold">⚠️</div>
        <div className="space-y-2">
          <h3 className="text-red-400 font-semibold text-lg">Si è verificato un errore</h3>
          <p className="text-gray-400 text-sm max-w-md">{error}</p>
        </div>
        <button
          onClick={fetchUsers}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-red-600/20 hover:shadow-red-600/30 active:scale-95 cursor-pointer"
        >
          Riprova a caricare
        </button>
      </div>
    );
  }

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
        <RoleFilter
          choice={filter}
          onChange={handleFilterChange}
        />
      </div>
      <div style={style}>
        {users.length === 0 ? (
          /* Nessun utente in totale */
          <div className="flex flex-col items-center justify-center p-12 bg-gray-800/40 rounded-xl border border-gray-700/50 shadow-md text-center">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-300 font-medium text-lg">Nessun utente presente</p>
            <p className="text-gray-400 text-sm mt-1 max-w-sm">La lista degli utenti è vuota.<br />Non ci sono risultati da visualizzare.</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          /* Nessun utente corrisponde al filtro */
          <div className="flex flex-col items-center justify-center p-12 bg-gray-800/40 rounded-xl border border-gray-700/50 shadow-md text-center">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-300 font-medium text-lg">Nessun risultato trovato</p>
            <p className="text-gray-400 text-sm mt-1 max-w-sm">
              Nessun utente corrisponde al filtro "{
                filter === 'user' ? 'Utenti' : filter === 'moderator' ? 'Moderatori' : filter === 'admin' ? 'Amministratori' : 'Null'
              }".
            </p>
            <button
              onClick={() => setFilter('')}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-all cursor-pointer"
            >
              Mostra tutti gli utenti
            </button>
          </div>
        ) : (
          /* Caricamento avvenuto con successo */
          <UserList
            users={paginatedTasks}
            onChange={handleUserDelete}
          />
        )}
      </div>
    </>
  )
}

export default App
