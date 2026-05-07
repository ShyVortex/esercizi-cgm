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