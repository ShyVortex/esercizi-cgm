import type { Task } from "../types/Task.ts";
import jsonData from '../resources/tasks.json';
import type { Preferences } from "../types/Preferences.ts";

export abstract class StorageService {
    private static LOCAL_STORAGE_KEY = 'app_tasks';
    private static USER_PREFERENCES_KEY = 'app_settings';
    private static sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    public static async loadTasks(): Promise<Task[]> {
        // Simula il caricamento
        await this.sleep(1000 + Math.random() * 2000);

        // Controlla se i dati sono già presenti nel LocalStorage
        const storedTasks: string | null = localStorage.getItem(this.LOCAL_STORAGE_KEY);

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

    public static loadPreferences(): Preferences {
        const storedPreferences: string | null = localStorage.getItem(this.USER_PREFERENCES_KEY);

        if (storedPreferences) {
            try {
                return JSON.parse(storedPreferences) as Preferences;
            } catch (error) {
                console.error("Errore nel parsing dei task da LocalStorage, ricarico il JSON di default:", error);
            }
        }

        // Se non sono presenti dati salvati, crea e restituisci i settaggi di default
        const defaultPreferences: Preferences = {
            pageSize: 10,
            filter: ''
        }

        return defaultPreferences;
    }

    private static savePreferences(prefs: Preferences): void {
        localStorage.setItem(this.USER_PREFERENCES_KEY, JSON.stringify(prefs));
    }

    public static savePageSize(size: number): void {
        const storedPreferences: Preferences = this.loadPreferences();

        storedPreferences.pageSize = size;

        this.savePreferences(storedPreferences);
    }

    public static saveFilter(filter: string): void {
        const storedPreferences: Preferences = this.loadPreferences();

        storedPreferences.filter = filter;

        this.savePreferences(storedPreferences);
    }
}