import type React from "react";
import { NavLink } from "react-router";
import type { User } from "../models/types/User";
import { authService } from "../api/auth.service";
import { AuthStorageService } from "../services/auth-storage.service";

export default function RouteComponent(): React.ReactElement {
    const btnRouteStyle: string = "mt-10 pt-2 pb-2 pl-3 pr-3 w-45 bg-gray-400 hover:bg-gray-300 text-black font-medium rounded cursor-pointer transition-colors duration-150 inline-block text-center";
    const btnRouteSelectedStyle: string = "mt-10 pt-2 pb-2 pl-3 pr-3 w-45 bg-gray-600 text-white font-medium rounded cursor-default transition-colors duration-150 inline-block text-center";
    const btnLogoutStyle: string = "mt-10 pt-2 pb-2 pl-3 pr-3 w-45 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded cursor-pointer transition-colors duration-150 shadow-md shadow-orange-500/20"; const user: User | undefined = AuthStorageService.getUser();

    const handleLogoutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        authService.AuthLogout();
    }

    return (
        <div className="flex flex-wrap flex-row gap-5 justify-center items-center">
            <NavLink
                to="/login"
                className={({ isActive }) =>
                    isActive ? btnRouteSelectedStyle : btnRouteStyle
                }
            >
                Login
            </NavLink>
            <NavLink
                to="/signup"
                className={({ isActive }) =>
                    isActive ? btnRouteSelectedStyle : btnRouteStyle
                }
            >
                Registrati
            </NavLink>
            <NavLink
                to="/public"
                className={({ isActive }) =>
                    isActive ? btnRouteSelectedStyle : btnRouteStyle
                }
            >
                Public
            </NavLink>
            {user ? (
                <NavLink
                    to="/private"
                    className={({ isActive }) =>
                        isActive ? btnRouteSelectedStyle : btnRouteStyle
                    }
                >
                    Private
                </NavLink>
            ) : (<></>)}
            {user ? (
                <NavLink
                    to="/public"
                    className={btnLogoutStyle}
                    onClick={handleLogoutClick}
                >
                    Logout
                </NavLink>
            ) : (<></>)}
        </div>
    );
}