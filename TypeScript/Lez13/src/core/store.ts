import { State, PerPage } from "../shared/types/state.js";
import { ResourceFields } from "../shared/types/resource-fields.js";
import { Post } from "../shared/types/post.js";

interface SharedState {
    allPosts: Post[];
    allUsers: Record<string, string>;
    filteredPosts: Post[];
    currentPage: number;
    itemsPerPage: number;
    userId: number | undefined;
    totalPages: number;
    currentEditId: string | null;
}

class Store {
    public shared: SharedState = {
        allPosts: [],
        allUsers: {},
        filteredPosts: [],
        currentPage: 1,
        itemsPerPage: 10,
        userId: undefined,
        totalPages: 0,
        currentEditId: null
    };

    public state: State = {
        resource: 'posts',
        page: 1,
        per_page: [
            { name: "posts", length: 5 },
            { name: "users", length: 5 },
            { name: "comments", length: 5 },
            { name: "roles", length: 5 },
            { name: "trash", length: 5 }
        ],
        search: '',
        isBin: false,
        isAuthenticated: false
    };

    public readonly resourceFields: ResourceFields = {
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

    public readonly allowedSections: string[] = ['posts', 'users', 'comments', 'roles'];

    // Utility to get per_page length for current resource
    public getPerPageLength(resource: string): number {
        const item = this.state.per_page.find(p => p.name === resource) || this.state.per_page.find(p => p.name === 'trash');
        return item ? item.length : 5;
    }
}

export const store = new Store();
