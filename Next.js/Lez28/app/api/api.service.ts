import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const BASE_URL: string = 'http://localhost:3000';

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ApiService {
    protected axiosInstance: AxiosInstance;

    constructor(baseURL: string = BASE_URL) {
        this.axiosInstance = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            timeout: 10000, // 10 secondi di timeout
        });

        this.initializeInterceptors();
    }

    /**
     * Inizializza gli intercettatori di richieste e risposte per Axios
     */
    private initializeInterceptors() {
        // Intercettatore delle Richieste
        this.axiosInstance.interceptors.request.use(
            (config) => {
                // Qui andrebbe il token JWT
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Intercettatore delle Risposte
        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => {
                // In caso di successo, restituiamo direttamente la risposta
                return response;
            },
            (error: AxiosError) => {
                // Gestione centralizzata dell'errore HTTP
                let errorMessage = 'Si è verificato un errore sconosciuto.';

                if (error.response) {
                    // Il server ha risposto con uno status code non 2xx
                    const status = error.response.status;
                    const data = error.response.data as any;
                    errorMessage = data?.message || `Errore del server (${status}): ${error.response.statusText || ''}`;
                } else if (error.request) {
                    // La richiesta è stata inviata ma non c'è stata risposta dal server
                    errorMessage = 'Nessuna risposta dal server. Controlla la tua connessione.';
                } else {
                    // Errore durante il setup della richiesta
                    errorMessage = error.message;
                }

                console.error('[API Service Error]:', errorMessage, error);
                return Promise.reject(new Error(errorMessage));
            }
        );
    }

    /**
     * Esegue una richiesta GET tipizzata
     */
    public async get<T>(url: string, headers?: Record<string, string>, config?: AxiosRequestConfig): Promise<T> {
        const mergedConfig: AxiosRequestConfig = {
            ...config,
            headers: {
                ...config?.headers,
                ...headers
            }
        };
        const response = await this.axiosInstance.get<T>(url, mergedConfig);
        return response.data;
    }

    /**
     * Esegue una richiesta POST tipizzata per creare una risorsa
     */
    public async post<T, D = any>(url: string, data?: D, headers?: Record<string, string>, config?: AxiosRequestConfig): Promise<T> {
        const mergedConfig: AxiosRequestConfig = {
            ...config,
            headers: {
                ...config?.headers,
                ...headers
            }
        };
        const response = await this.axiosInstance.post<T>(url, data, mergedConfig);
        return response.data;
    }

    /**
     * Esegue una richiesta PUT tipizzata per sovrascrivere/aggiornare interamente una risorsa
     */
    public async put<T, D = any>(url: string, data?: D, headers?: Record<string, string>, config?: AxiosRequestConfig): Promise<T> {
        const mergedConfig: AxiosRequestConfig = {
            ...config,
            headers: {
                ...config?.headers,
                ...headers
            }
        };
        const response = await this.axiosInstance.put<T>(url, data, mergedConfig);
        return response.data;
    }

    /**
     * Esegue una richiesta PATCH tipizzata per aggiornare parzialmente una risorsa
     */
    public async patch<T, D = any>(url: string, data?: D, headers?: Record<string, string>, config?: AxiosRequestConfig): Promise<T> {
        const mergedConfig: AxiosRequestConfig = {
            ...config,
            headers: {
                ...config?.headers,
                ...headers
            }
        };
        const response = await this.axiosInstance.patch<T>(url, data, mergedConfig);
        return response.data;
    }

    /**
     * Esegue una richiesta DELETE tipizzata per eliminare una risorsa
     */
    public async delete<T>(url: string, headers?: Record<string, string>, config?: AxiosRequestConfig): Promise<T> {
        const mergedConfig: AxiosRequestConfig = {
            ...config,
            headers: {
                ...config?.headers,
                ...headers
            }
        };
        const response = await this.axiosInstance.delete<T>(url, mergedConfig);
        return response.data;
    }

    /**
     * Permette l'accesso alla risposta Axios intera (es. per leggere gli header come X-Total-Count di json-server)
     */
    public async getFullResponse<T>(url: string, headers?: Record<string, string>, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        const mergedConfig: AxiosRequestConfig = {
            ...config,
            headers: {
                ...config?.headers,
                ...headers
            }
        };
        return this.axiosInstance.get<T>(url, mergedConfig);
    }
}

export const apiService = new ApiService();
