import { apiService } from "./api.service";
import { AuthStorageService } from "../services/auth-storage.service";
import type { LoginRequest, SignupRequest } from "../models/requests/auth-requests";
import type { AuthResponse } from "../models/responses/auth-response";
import type { AuthStorageData } from "../models/types/AuthStorageData";

export class AuthService {
    public async AuthLogin(request: LoginRequest): Promise<AuthResponse> {
        const response = await apiService.post<AuthResponse, LoginRequest>('/login', request);

        const storageData: AuthStorageData = {
            ...response,
            storedAt: new Date().getTime()
        }

        AuthStorageService.setAuthData(storageData);
        return response;
    }

    public async AuthSignUp(request: SignupRequest): Promise<AuthResponse> {
        const response = await apiService.post<AuthResponse, SignupRequest>('/register', request);

        const storageData: AuthStorageData = {
            ...response,
            storedAt: new Date().getTime()
        }

        AuthStorageService.setAuthData(storageData);
        return response;
    }

    public AuthLogout(): void {
        AuthStorageService.removeAuthData();
    }

    public AuthVerifyUser(): boolean {
        return AuthStorageService.hasToken() && !AuthStorageService.hasTokenExpired();
    }
}

export const authService = new AuthService();