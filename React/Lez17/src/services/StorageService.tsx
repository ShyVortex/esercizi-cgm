import type { Task } from "../types/Task.ts";
import jsonData from '../resources/tasks.json';

export abstract class StorageService {
    private static LOCAL_STORAGE_KEY = 'app_tasks';

    public static loadTasks(): Task[] {
        // Controlla se i dati sono già presenti nel LocalStorage
        const storedTasks = localStorage.getItem(this.LOCAL_STORAGE_KEY);

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
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(jsonData));

        // Ritorna i dati tipizzati dal JSON
        return jsonData as Task[];
    }

    public static saveTasks(tasks: Task[]): void {
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    }
}