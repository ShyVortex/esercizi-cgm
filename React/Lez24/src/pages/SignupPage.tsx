import type React from "react";
import { authService } from "../api/auth.service";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import RouteComponent from "../components/RouteComponent";
import type { SignupRequest } from "../models/requests/auth-requests";
import { Role } from "../models/types/User";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function SignupPage(): React.ReactElement {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!email.trim() || !password.trim()) {
            setErrorMessage("Per favore inserisci sia l'email che la password.");
            return;
        }

        if (!username.trim() || !firstName.trim() || !lastName.trim()) {
            setErrorMessage("Tutti i campi tranne il secondo nome sono obbligatori.");
            return;
        }

        setIsLoading(true);

        try {
            const request: SignupRequest = {
                email: email,
                password: password,
                username: username,
                firstName: firstName,
                middleName: middleName.trim() || undefined,
                lastName: lastName,
                role: Role.READER,
                permissions: ['users-view', 'user-details']
            }

            await authService.AuthSignUp(request);

            // Toast di successo con SweetAlert2
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: '#1f2937',
                color: '#fff',
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer);
                    toast.addEventListener('mouseleave', Swal.resumeTimer);
                }
            });

            Toast.fire({
                icon: 'success',
                title: 'Registrazione effettuata con successo!'
            });

            // Reindirizzamento alla pagina privata
            navigate("/private");
        } catch (error: any) {
            console.error("Signup error:", error);
            setErrorMessage((error as Error)?.message || "Credenziali non valide o errore del server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen text-gray-100 flex flex-col items-center">
            <RouteComponent />

            <div className="mt-16 mb-10 w-full max-w-md p-8 bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-2xl transition-all duration-300">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 text-purple-400 mb-4 border border-purple-500/20 text-3xl">
                        ✍️
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Registrati</h2>
                    <p className="mt-2 text-sm text-gray-400">Crea un nuovo utente per accedere all'area riservata</p>
                </div>

                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm flex items-center gap-2">
                        <span className="text-lg leading-none">⚠️</span>
                        <span className="leading-relaxed">{errorMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                            Indirizzo Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                                </svg>
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                disabled={isLoading}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                                placeholder="nome@esempio.it"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                disabled={isLoading}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-10 py-3 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                            >
                                {showPassword ? (
                                    <svg className="h-5 w-5 animate-fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.815 7.815L21 21m-3.956-3.956l-3.09-3.09m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 animate-fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                            Username
                        </label>
                        <div className="relative">
                            <input
                                id="username"
                                name="username"
                                type="username"
                                required
                                disabled={isLoading}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full pl-3 pr-3 py-3 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                                placeholder="DeStruCtioN-xX"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                            Nome
                        </label>
                        <div className="relative">
                            <input
                                id="firstName"
                                name="firstName"
                                type="firstName"
                                required
                                disabled={isLoading}
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="block w-full pl-3 pr-3 py-3 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                                placeholder="Angelo"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="middleName" className="block text-sm font-medium text-gray-300 mb-2">
                            Secondo Nome (facoltativo)
                        </label>
                        <div className="relative">
                            <input
                                id="middleName"
                                name="middleName"
                                type="middleName"
                                disabled={isLoading}
                                value={middleName}
                                onChange={(e) => setMiddleName(e.target.value)}
                                className="block w-full pl-3 pr-3 py-3 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                                placeholder="Vincenzo"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                            Cognome
                        </label>
                        <div className="relative">
                            <input
                                id="lastName"
                                name="lastName"
                                type="lastName"
                                required
                                disabled={isLoading}
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="block w-full pl-3 pr-3 py-3 bg-gray-900/60 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                                placeholder="Trotta"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-lg shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Registrazione in corso...
                            </>
                        ) : (
                            "Registrati"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}