export const IS_LOCAL: boolean = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export const BASE_URL: string = IS_LOCAL ? "http://localhost:3000" : "/api";

export const WINDOW_URL: string = "http://localhost:8080";

export const APP_CONFIG = {
    DEFAULT_PAGE_SIZE: 5,
    LOGIN_USERNAME: 'admin',
    LOGIN_PASSWORD: 'admin'
};
