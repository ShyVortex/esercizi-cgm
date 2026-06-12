export type State = {
    id: string;
    name: string;
    priority: 'none' | 'low' | 'medium' | 'high';
    isActive: boolean;
}

export type Task = {
    id: string;
    title: string;
    description: string;
    assignedTo: string; // userId
    start: Date;
    end: Date;
    stateId: string;
    state?: State;
    estimatedLength: number;
    effectiveLength: number;
    projectId: string;
    isActive: boolean;
}