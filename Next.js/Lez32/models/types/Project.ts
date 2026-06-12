import { State, Task } from "./Task";

export type Project = {
    id: string;
    title: string;
    description: string;
    tasks?: Task[]; // un progetto è costituito da 3 tasks
    stateId: string;
    state?: State;
    isActive: boolean;
}