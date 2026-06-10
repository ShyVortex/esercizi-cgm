export default function NotFound() {
    return (
        <div className="p-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-center">
            <h2 className="text-yellow-500 text-xl font-bold mb-2">Utente non disponibile</h2>
            <p className="text-gray-300">
                L&apos;utente richiesto non esiste o non è più disponibile nel catalogo.
            </p>
        </div>
    );
}
