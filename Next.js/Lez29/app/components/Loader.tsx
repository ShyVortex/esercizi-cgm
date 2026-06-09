export default function Loader(): React.ReactElement {
    return (
        <div className="mt-10 flex flex-col items-center justify-center min-h-screen gap-4 p-8 bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm shadow-xl">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-gray-300 font-medium animate-pulse text-lg">Caricamento degli utenti in corso...</p>
        </div>
    );
}