/*
  Crea un'interfaccia che mostri una lista di attività, con i campi id (number), title (string), description (string)
  e completed (boolean). Quando viene selezionato un'attività deve essere mostrato sotto oppure accanto alla lista
  la descrizione di quest'ultima. Non usare index per le key delle lista e l'id della task selezionata e la funzione che
  l'aggiorna passare dal componente padre al componente figlio.
  I componenti dovranno essere: App, TaskList (componente padre delle attività) e TaskRow
  (componente figlio delle attività).
  
  Successivamente aggiungi un filtro per mostrare solo le attività completata, quelle non completate
  oppure tutte le attività, senza perdere la collezione sorgente.
  Nella lista implementa anche la paginazione. Salva le attività nel local storage e ricaricale da lì
  quando viene aperta la pagina.
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
  const [tasks, setTasks] = useState<Task[]>(StorageService.loadTasks());
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(StorageService.loadPreferences().pageSize);
  const [filter, setFilter] = useState<string>(StorageService.loadPreferences().filter);

  const style: React.CSSProperties = {
    marginTop: '40px'
  }

  // Quando le attività o le preferenze vengono aggiornate, le salviamo in LocalStorage
  useEffect(() => {
    StorageService.saveTasks(tasks);
    StorageService.savePageSize(pageSize);
    StorageService.saveFilter(filter);
  }, [tasks, pageSize, filter]);

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
  const handleTasksChange = (newTasks: Task[]): void => {
    setTasks(newTasks);
    setCurrentPage(1);
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
        <TaskList
          tasks={paginatedTasks}
          onChange={handleTasksChange}
        />
      </div>
    </>
  )
}

export default App
