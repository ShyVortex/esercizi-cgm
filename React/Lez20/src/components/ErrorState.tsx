import React from "react";

type Props = {
    title: string;
    message: string;
    btnText: string;
    onClick?: () => void;
}

export default function ErrorState({ title, message, btnText, onClick: fetchUsers }: Props): React.ReactElement {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 bg-red-950/20 rounded-xl border border-red-900/30 shadow-xl text-center">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-400 text-2xl font-bold">⚠️</div>
            <div className="space-y-2">
                <h3 className="text-red-400 font-semibold text-lg">{title}</h3>
                <p className="text-gray-400 text-sm max-w-md">{message}</p>
            </div>
            <button
                onClick={fetchUsers}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-red-600/20 hover:shadow-red-600/30 active:scale-95 cursor-pointer"
            >
                {btnText}
            </button>
        </div>
    );
}