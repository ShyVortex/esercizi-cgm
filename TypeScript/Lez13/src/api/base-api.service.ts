import { BASE_URL } from "../core/constants.js";

export abstract class BaseApiService<T> {
    protected baseUrl: string = BASE_URL;
    protected abstract resource: string;

    protected async request<R>(path: string = '', options: RequestInit = {}): Promise<R> {
        const url = `${this.baseUrl}/${this.resource}${path}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        // Handle empty responses (like DELETE)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
        }
        return {} as R;
    }

    public async getAll(params: string = ''): Promise<T[]> {
        return this.request<T[]>(params);
    }

    public async getById(id: string | number): Promise<T> {
        return this.request<T>(`/${id}`);
    }

    public async create(data: Partial<T> | Record<string, any>): Promise<T> {
        return this.request<T>('', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    public async update(id: string | number, data: Partial<T> | Record<string, any>): Promise<T> {
        return this.request<T>(`/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    public async delete(id: string | number): Promise<void> {
        await this.request(`/${id}`, {
            method: 'DELETE',
        });
    }
}
