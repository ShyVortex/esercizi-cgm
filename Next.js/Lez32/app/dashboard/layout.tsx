"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthStorageService } from "../services/auth-storage.service";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const user = AuthStorageService.getUser();
    const roleId = String(user?.role || "1");
    const isAdmin = roleId === "3";

    const baseLinkStyle = "px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-150";
    const activeLinkStyle = "bg-gray-800 text-white shadow-md border border-gray-700/50";
    const inactiveLinkStyle = "text-gray-400 hover:text-white hover:bg-gray-800/30";

    const roleName = isAdmin ? "Amministratore" : roleId === "2" ? "Manager" : "Utente";
    const roleColorClass = isAdmin 
        ? "bg-red-500/10 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-md font-extrabold ml-1.5 inline-block" 
        : roleId === "2" 
            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2.5 py-1 rounded-md font-extrabold ml-1.5 inline-block" 
            : "bg-green-500/10 text-green-400 border border-green-500/30 px-2.5 py-1 rounded-md font-extrabold ml-1.5 inline-block";

    return (
        <div className="w-full max-w-[1320px] mx-auto mt-6 px-4">
            {/* Sub-NavBar per la navigazione interna della Dashboard */}
            <div className="flex flex-row justify-between items-center bg-gray-900/40 backdrop-blur-md border border-gray-700/50 p-3 rounded-2xl mb-8 shadow-xl">
                <div className="flex gap-4">
                    {/* Accessibile da tutti (User, Manager, Admin) */}
                    <Link
                        href="/dashboard/tasks"
                        className={`${baseLinkStyle} ${pathname === "/dashboard/tasks" ? activeLinkStyle : inactiveLinkStyle}`}
                    >
                        Attività
                    </Link>
                    <Link
                        href="/dashboard/projects"
                        className={`${baseLinkStyle} ${pathname === "/dashboard/projects" ? activeLinkStyle : inactiveLinkStyle}`}
                    >
                        Progetti
                    </Link>

                    {/* Accessibile solo all'Admin */}
                    {isAdmin && (
                        <>
                            <Link
                                href="/dashboard/states"
                                className={`${baseLinkStyle} ${pathname === "/dashboard/states" ? activeLinkStyle : inactiveLinkStyle}`}
                            >
                                Stati
                            </Link>
                            <Link
                                href="/dashboard/users"
                                className={`${baseLinkStyle} ${pathname === "/dashboard/users" ? activeLinkStyle : inactiveLinkStyle}`}
                            >
                                Utenti
                            </Link>
                        </>
                    )}
                </div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-wide px-3">
                    Dashboard: <span className={roleColorClass}>{roleName}</span>
                </div>
            </div>
            <div>{children}</div>
        </div>
    );
}
