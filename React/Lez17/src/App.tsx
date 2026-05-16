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

import React from 'react'
import { useState } from 'react'
import './App.css'
import type { Task } from './types/Task'
import TaskList from './components/TaskList'
import { PaginationComponent } from "./components/Pagination.tsx";
import {StorageService} from "./services/StorageService.tsx";
import SizeSelector from "./components/SizeSelector.tsx";

function App() {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState(10)

  const tasks: Task[] = StorageService.loadTasks();

  const style: React.CSSProperties = {
    marginTop: '40px'
  }

  // Logica di paginazione
  const pages: number = Math.max(1, Math.ceil(tasks.length / pageSize));
  const startIndex: number = (currentPage - 1) * pageSize;
  const endIndex: number = startIndex + pageSize;

  // Estraiamo solo i task che vanno da startIndex a endIndex
  const paginatedTasks: Task[] = tasks.slice(startIndex, endIndex);

  // Quando cambia il numero di elementi per pagina,
  // si resetta la pagina corrente a 1 per evitare errori di out-of-bounds
  const handlePageSizeChange = (newSize: number): void => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <>
      <PaginationComponent
          currentPage={currentPage}
          totalPages={pages}
          onPageChange={(page: number): void => setCurrentPage(page)}
      />
      <SizeSelector
          value={pageSize}
          onChange={handlePageSizeChange}
      />
      <div style={style}>
        <TaskList tasks={paginatedTasks} />
      </div>
    </>
  )
}

export default App
