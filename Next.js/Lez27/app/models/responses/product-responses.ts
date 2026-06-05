import { Product } from "../types/Product";

export interface GetFPProductsResponse {
    first: number;
    prev: number | null;
    next: number | null;
    last: number;
    pages: number;
    items: number;
    data: Product[] | null;
}
