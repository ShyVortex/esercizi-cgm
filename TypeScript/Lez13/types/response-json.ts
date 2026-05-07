import { Item } from "./item.js"

export type ResponseJson = {
    first: number,
    prev: number | null,
    next: number | null,
    last: number | null,
    pages: number,
    items: number,
    data: Item[]
}