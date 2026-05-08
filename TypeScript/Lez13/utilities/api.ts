const localDb: string = 'db.json';

export let isLocal: boolean = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export const BASE_URL: string = isLocal ? "http://localhost:3000" : "/api";

export const WINDOW_URL: string = "http://localhost:8080";