"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@/models/types/User";
import { authService } from "../api/auth.service";
import { AuthStorageService } from "../services/auth-storage.service";

export default function NavBar(): React.ReactElement {
    const pathname = usePathname();
    const [user, setUser] = useState<User | undefined>(undefined);

    useEffect(() => {
        (async () => setUser(AuthStorageService.getUser()))();
    }, [pathname]);

    const btnRouteStyle: string = "mt-10 pt-2 pb-2 pl-3 pr-3 w-45 bg-gray-400 hover:bg-gray-300 text-black font-medium rounded cursor-pointer transition-colors duration-150 inline-block text-center";
    const btnRouteSelectedStyle: string = "mt-10 pt-2 pb-2 pl-3 pr-3 w-45 bg-gray-600 text-white font-medium rounded cursor-default transition-colors duration-150 inline-block text-center";
    const btnLogoutStyle: string = "mt-10 pt-2 pb-2 pl-3 pr-3 w-45 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded cursor-pointer transition-colors duration-150 shadow-md shadow-orange-500/20";

    const handleLogoutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        authService.AuthLogout();
    }

    return (
        <div className="flex flex-wrap flex-row gap-5 justify-center items-center">
            {!user ? (
                <Link
                    href="/login"
                    className={pathname === "/login" ? btnRouteSelectedStyle : btnRouteStyle}
                >
                    Login
                </Link>
            ) : (
                <>
                    <Link
                        href="/profile"
                        className={pathname === "/profile" ? btnRouteSelectedStyle : btnRouteStyle}
                    >
                        Profilo
                    </Link>
                    <Link
                        href="/dashboard"
                        className={pathname.startsWith("/dashboard") ? btnRouteSelectedStyle : btnRouteStyle}
                    >
                        Dashboard
                    </Link>
                    <a
                        href="/login"
                        className={btnLogoutStyle}
                        onClick={handleLogoutClick}
                    >
                        Logout
                    </a>
                </>
            )}
        </div>
    );
}