import type React from "react";

export default function RouteComponent(): React.ReactElement {
    const btnRouteStyle: string = "mt-10 pt-2 pb-2 pl-3 pr-3 w-45 bg-gray-400 hover:bg-gray-300 text-black font-medium rounded cursor-pointer transition-colors duration-150";

    return (
        <div className="flex flex-wrap flex-row gap-8 justify-center items-center">
            <button className={btnRouteStyle}>
                Login
            </button>
            <button className={btnRouteStyle}>
                Registrati
            </button>
            <button className={btnRouteStyle}>
                Public
            </button>
            <button className={btnRouteStyle}>
                Admin
            </button>
        </div>
    );
}