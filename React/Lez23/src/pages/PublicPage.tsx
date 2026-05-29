import type React from "react";
import RouteComponent from "../components/RouteComponent";

export default function PublicPage(): React.ReactElement {
    return (
        <div>
            <RouteComponent />
            <div className="mt-30 flex flex-col items-center justify-center p-12 bg-gray-800/40 rounded-xl border border-gray-700/50 shadow-md text-center">
                <div className="text-4xl mb-4">🌎</div>
                <p className="text-gray-300 font-medium text-lg">Pagina Pubblica</p>
                <div className="mt-10 text-4xl mb-4">
                    <p className="pb-3 text-gray-300 font-sm text-base">Benvenuto!</p>
                    <p className="text-gray-300 font-sm text-base">Questa pagina è accessibile a tutti.</p>
                </div>
            </div>
        </div>
    );
}