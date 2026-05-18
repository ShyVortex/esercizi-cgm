/*
  Partendo dall'esercizio precedente sulle gestione attività, introduci l'hook di React "useEffect" per gestire
  la paginazione quando viene cambiata la pagina oppure il numero di elementi da mostrare per pagina.
  
  Crea un service su un apposito file che simuli il caricamento del back-end con durata da 1 a 3 secondi e
  restituisci i dati richiesti. Ricordati di usare gli stati dell'UI quando c'è un caricamento, un empty state,
  un errore oppure un caricamento avvenuto con successo.
*/

import React, { useEffect } from 'react';
import { useState } from 'react';
import './App.css';
import type { Task } from './types/Task';
import TaskList from './components/TaskList';
import PaginationComponent from "./components/Pagination.tsx";
import { StorageService } from "./services/StorageService.ts";
import SizeSelector from "./components/SizeSelector.tsx";
import StatusFilter from './components/StatusFilter.tsx';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(StorageService.loadPreferences().pageSize);
  const [filter, setFilter] = useState<string>(StorageService.loadPreferences().filter);

  const style: React.CSSProperties = {
    marginTop: '40px'
  }

  // Caricamento asincrono dei task
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await StorageService.loadTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il caricamento delle attività');
    } finally {
      setIsLoading(false);
    }
  };

  /* Hook al mount: questo useEffect() si attiva una sola volta al caricamento della pagina
     perché non osserva il cambiamento di stato di nessuna variabile */
  useEffect(() => {
    (async () => {
      fetchTasks();
    })();
  }, []);

  // Quando le attività o le preferenze vengono aggiornate, le salviamo in LocalStorage
  useEffect(() => {
    // Salviamo i task solo se non siamo in fase di caricamento e non ci sono errori
    if (!isLoading && !error) {
      StorageService.saveTasks(tasks);
    }
    StorageService.savePageSize(pageSize);
    StorageService.saveFilter(filter);
  }, [tasks, pageSize, filter, isLoading, error]);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'true') return task.completed === true;
    if (filter === 'false') return task.completed === false;

    return true; // Se il filtro è vuoto, le teniamo tutte
  });

  const totalPages: number = Math.max(1, Math.ceil(filteredTasks.length / pageSize));

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

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

  // Se viene modificato un task, aggiorniamo la lista originale
  const handleTaskUpdate = (updatedTask: Task): void => {
    const newTasks = tasks.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    );
    setTasks(newTasks);
  }

  // Stato 1: Caricamento
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-8 bg-gray-800/50 rounded-xl border border-gray-700/50 backdrop-blur-sm shadow-xl">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-gray-300 font-medium animate-pulse text-lg">Caricamento delle attività in corso...</p>
      </div>
    );
  }

  // Stato 2: Errore
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-6 p-8 bg-red-950/20 rounded-xl border border-red-900/30 shadow-xl text-center">
        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-400 text-2xl font-bold">⚠️</div>
        <div className="space-y-2">
          <h3 className="text-red-400 font-semibold text-lg">Si è verificato un errore</h3>
          <p className="text-gray-400 text-sm max-w-md">{error}</p>
        </div>
        <button
          onClick={fetchTasks}
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
        <StatusFilter
          choice={filter}
          onChange={handleFilterChange}
        />
      </div>
      <div style={style}>
        {tasks.length === 0 ? (
          /* Nessuna attività in totale */
          <div className="flex flex-col items-center justify-center p-12 bg-gray-800/40 rounded-xl border border-gray-700/50 shadow-md text-center">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-300 font-medium text-lg">Nessuna attività registrata</p>
            <p className="text-gray-400 text-sm mt-1 max-w-sm">La lista dei task è vuota. Non ci sono attività da visualizzare.</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          /* Nessuna attività corrisponde al filtro */
          <div className="flex flex-col items-center justify-center p-12 bg-gray-800/40 rounded-xl border border-gray-700/50 shadow-md text-center">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-300 font-medium text-lg">Nessun risultato trovato</p>
            <p className="text-gray-400 text-sm mt-1 max-w-sm">
              Nessuna attività corrisponde al filtro "{filter === 'true' ? 'Completati' : 'Non completati'}".
            </p>
            <button
              onClick={() => setFilter('')}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-all cursor-pointer"
            >
              Mostra tutte le attività
            </button>
          </div>
        ) : (
          /* Caricamento avvenuto con successo */
          <TaskList
            tasks={paginatedTasks}
            onChange={handleTaskUpdate}
          />
        )}
      </div>
    </>
  )
}

export default App
