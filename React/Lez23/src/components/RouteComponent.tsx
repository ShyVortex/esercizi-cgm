import type React from "react";
import { NavLink, useNavigate, type NavigateFunction } from "react-router";
import type { User } from "../models/types/User";
import { AuthStorageService } from "../services/auth-storage.service";

export default function RouteComponent(): React.ReactElement {
    const btnRouteStyle: string = "mt-10 pt-2 pb-2 pl-3 pr-3 w-45 bg-gray-400 hover:bg-gray-300 text-black font-medium rounded cursor-pointer transition-colors duration-150 inline-block text-center";
    const btnRouteSelectedStyle: string = "mt-10 pt-2 pb-2 pl-3 pr-3 w-45 bg-gray-600 text-white font-medium rounded cursor-default transition-colors duration-150 inline-block text-center";
    const navigate: NavigateFunction = useNavigate();

    const handlePrivateClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const user: User | undefined = AuthStorageService.getUser();

        if (user === undefined) {
            e.preventDefault();
            navigate("/login");
        }
    }

    return (
        <div className="flex flex-wrap flex-row gap-8 justify-center items-center">
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
            <NavLink
                to="/private"
                className={({ isActive }) =>
                    isActive ? btnRouteSelectedStyle : btnRouteStyle
                }
                onClick={handlePrivateClick}
            >
                Private
            </NavLink>
        </div>
    );
}