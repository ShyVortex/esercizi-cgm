export type PerPage = {
    name: "posts" | "users" | "comments" | "roles" | "trash",
    length: number
}

export type State = {
    resource: string,
    page: number,
    per_page: PerPage[],
    search: string,
    isBin: boolean,
    isAuthenticated: boolean
}