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

import jsonData from './resources/tasks.json';
import { useState } from 'react'
import './App.css'
import type { Task } from './types/Task'
import TaskList from './components/TaskList'

const LOCAL_STORAGE_KEY = 'app_tasks';

function loadTasks(): Task[] {
  // Controlla se i dati sono già presenti nel LocalStorage
  const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (storedTasks) {
    try {
      // Se presenti, parsa la stringa JSON e restituisci l'array
      return JSON.parse(storedTasks) as Task[];
    } catch (error) {
      console.error("Errore nel parsing dei task da LocalStorage, ricarico il JSON di default:", error);
      // In caso di errore di parsing (es. dati corrotti), fa il fallback al JSON di base
    }
  }

  // Al primo avvio (o se il storage era vuoto/corrotto):
  // Salva il JSON iniziale nel LocalStorage convertito in stringa
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(jsonData));

  // Ritorna i dati tipizzati dal JSON
  return jsonData as Task[];
}

function App() {
  const [count, setCount] = useState(0)

  const tasks: Task[] = loadTasks();

  const style: React.CSSProperties = {
    marginTop: '65px'
  }

  return (
    <>
      <div style={style}>
        <TaskList tasks={tasks} />
      </div>
    </>
  )
}

export default App
