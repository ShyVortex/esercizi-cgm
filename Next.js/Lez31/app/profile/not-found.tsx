export default function NotFound() {
    return (
        <div className="mt-10 p-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-center">
            <h2 className="text-yellow-500 text-xl font-bold mb-2">Profilo non disponibile</h2>
            <p className="text-gray-300">
                Impossibile caricare il profilo in quanto l&apos;utente non è stato trovato.
            </p>
        </div>
    );
}
