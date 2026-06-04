import { ProductSet } from "./Product"

export type Cart = {
    items: ProductSet[];
    storedAt: number;
}