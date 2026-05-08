import { Post } from "../types/post.js";
import { User } from "../types/user.js";
import { Comment } from "../types/comment.js";
import { Role } from "../types/role.js";
import { Item } from "../types/item.js";
import { ResponseJson } from "../types/response-json.js";

// ---- TYPE GUARDS ---- //

export function isPost(item: any): item is Post {
    return item && typeof item.userId === 'number'
        && typeof item.id === 'string'
        && typeof item.title === 'string'
        && typeof item.body === 'string'
        && typeof item.isActive === 'boolean'
}

export function isUser(item: any): item is User {
    return item && typeof item.id === 'string'
        && typeof item.name === 'string'
        && typeof item.surname === 'string'
        && typeof item.email === 'string'
        && (typeof item.address === 'object' || typeof item.address === 'string')
        && typeof item.phone === 'string'
        && typeof item.website === 'string'
        && (typeof item.company === 'object' || typeof item.company === 'string')
        && typeof item.isActive === 'boolean'
        && item.role ? typeof item.role === 'object' : true
}

export function isComment(item: any): item is Comment {
    return item && typeof item.postId === 'number'
        && typeof item.id === 'string'
        && typeof item.name === 'string'
        && typeof item.email === 'string'
        && typeof item.body === 'string'
        && typeof item.isActive === 'boolean'
}

export function isRole(item: any): item is Role {
    return item && typeof item.id === 'string'
        && typeof item.name === 'string'
        && typeof item.isActive === 'boolean'
}

export function isItemArray(item: any): item is Item[] {
    return Array.isArray(item)
        && item.every(element => isPost(element) || isUser(element) || isComment(element));
}

export function isResponseJson(item: any): item is ResponseJson {
    return item && typeof item.first === 'number'
        && typeof item.prev === 'number' || typeof item.prev === 'object'
        && typeof item.next === 'number' || typeof item.next === 'object'
        && typeof item.last === 'number' || typeof item.last === 'object'
        && typeof item.pages === 'number'
        && typeof item.items === 'number'
        && typeof item.data === 'object'
}
