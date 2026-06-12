export interface GetFPStatesRequest {
    page?: number;
    limit?: number;
    filter?: string;
    isActive?: string;
}

export interface SaveStateRequest {
    id?: string;
    name: string;
    priority: 'none' | 'low' | 'medium' | 'high';
    isActive: boolean;
}