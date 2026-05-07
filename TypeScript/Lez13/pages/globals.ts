import { Post } from "../types/post";
import { ResourceFields } from "../types/resource-fields";
import { State } from "../types/state";

export let shared = {
    allPosts: [] as Post[],
    allUsers: {} as Record<string, string>,
    filteredPosts: [] as Post[],
    currentPage: 1,
    itemsPerPage: 10,
    userId: undefined as number | undefined,
    totalPages: 0,
    currentEditId: null as string | null
};

// Stato globale
export let state: State = {
    resource: 'posts',
    page: 1,
    per_page: 5,
    search: '',
    isBin: false,
    isAuthenticated: false
};

// Mappa dei campi richiesti per ogni risorsa
export const resourceFields: ResourceFields = {
    posts: ['title', 'body', 'userId'],
    users: [
        'name', 'username', 'email', 'phone', 'website',
        'address.city', 'address.street', 'address.suite',
        'address.zipcode', 'company.name', 'company.catchPhrase',
        'company.bs'
    ],
    comments: ['name', 'email', 'body', 'postId'],
    roles: ['name']
};