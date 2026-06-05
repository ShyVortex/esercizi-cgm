import type { Preferences } from "../models/types/Preferences";

export abstract class PreferencesService {
    private static PREFERENCES_KEY: string = 'app_settings';

    public static loadPreferences(): Preferences {
        if (typeof window === 'undefined') {
            return {
                pageSize: 10,
                filter: ''
            };
        }

        const storedPreferences: string | null = localStorage.getItem(this.PREFERENCES_KEY);

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
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(prefs));
        }
    }

    public static savePreference(
        pref: 'pageSize' | 'filter',
        value: number | string
    ): void {
        const storedPreferences: Preferences = this.loadPreferences();

        switch (pref) {
            case 'pageSize':
                storedPreferences.pageSize = value as number;
                break;
            case 'filter':
                storedPreferences.filter = value as string;
                break;
            default:
                break;
        }

        this.savePreferences(storedPreferences);
    }
}