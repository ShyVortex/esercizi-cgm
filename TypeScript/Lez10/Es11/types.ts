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
export type User = {
    id: string;
    name: string;
    username: string;
    email: string;
    address: Address;
    phone: string;
    website: string;
    company: Company;
    isActive: boolean;
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