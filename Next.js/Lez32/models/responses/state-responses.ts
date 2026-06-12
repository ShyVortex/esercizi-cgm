import { State } from "../types/Task";

export interface GetFPStatesResponse {
    first: number;
    prev: number | null;
    next: number | null;
    last: number;
    pages: number;
    items: number;
    data: State[] | null;
}