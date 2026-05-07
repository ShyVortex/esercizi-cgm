// ---------------------- POST ---------------------- //
export type Post = {
    userId: number;
    id: string;
    title: string;
    body: string;
    isActive: boolean;
}
// ------------------------------------------------- //

// ---------------------- USER ---------------------- //
export type Address = {
    city: string;
    street: string;
    suite: string;
    zipcode: string;
}
export type Company = {
    name: string;
    catchPhrase: string;
    bs: string;
}
export type Role = {
    id: string;
    name: string;
    isActive: boolean;
}
export type User = {
    id: string;
    name: string;
    username: string;
    email: string;
    address: Address | string;
    phone: string;
    website: string;
    company: Company | string;
    isActive: boolean;
    role?: Role;
}
// ------------------------------------------------- //

// ---------------------- COMMENT ---------------------- //
export type Comment = {
    postId: number;
    id: string;
    name: string;
    email: string;
    body: string;
    isActive: boolean;
}
// ------------------------------------------------- //

// ---------------------- ADMIN TYPES ---------------------- //
export type State = {
    resource: string,
    page: number,
    per_page: number,
    search: string,
    isBin: boolean,
    isAuthenticated: boolean
}

export type ResourceFields = {
    posts: string[],
    users: string[],
    comments: string[],
    roles: string[]
}

export type Item = Post | User | Comment;

export type ResponseJson = {
    first: number,
    prev: number | null,
    next: number | null,
    last: number | null,
    pages: number,
    items: number,
    data: Item[]
}

export type Data = Post[] | User[] | Comment[]
// ------------------------------------------------- //