// ---- TYPE GUARDS ---- //
export function isPost(item) {
    return item && typeof item.userId === 'number'
        && typeof item.id === 'string'
        && typeof item.title === 'string'
        && typeof item.body === 'string'
        && typeof item.isActive === 'boolean';
}
export function isUser(item) {
    return item && typeof item.id === 'string'
        && typeof item.name === 'string'
        && typeof item.surname === 'string'
        && typeof item.email === 'string'
        && (typeof item.address === 'object' || typeof item.address === 'string')
        && typeof item.phone === 'string'
        && typeof item.website === 'string'
        && (typeof item.company === 'object' || typeof item.company === 'string')
        && typeof item.isActive === 'boolean'
        && item.role ? typeof item.role === 'object' : true;
}
export function isComment(item) {
    return item && typeof item.postId === 'number'
        && typeof item.id === 'string'
        && typeof item.name === 'string'
        && typeof item.email === 'string'
        && typeof item.body === 'string'
        && typeof item.isActive === 'boolean';
}
export function isRole(item) {
    return item && typeof item.id === 'string'
        && typeof item.name === 'string'
        && typeof item.isActive === 'boolean';
}
