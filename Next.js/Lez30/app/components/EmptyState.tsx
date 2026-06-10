export function TotalEmptyState(): React.ReactElement {
    return (
        <div className="flex flex-col my-auto self-center items-center justify-center p-12 bg-gray-800/40 rounded-xl border border-gray-700/50 shadow-md text-center">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-300 font-medium text-lg">Nessun utente presente</p>
            <p className="text-gray-400 text-sm mt-1 max-w-sm">La lista degli utenti è vuota.<br />Non ci sono risultati da visualizzare.</p>
        </div>
    )
}

type Props = {
    filter: string;
    givenStr: string;
    onClick?: (str: string) => void;
}

export function FilterEmptyState({ filter, givenStr, onClick: handleClick }: Props): React.ReactElement {
    return (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-800/40 rounded-xl border border-gray-700/50 shadow-md text-center">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-300 font-medium text-lg">Nessun risultato trovato</p>
            <p className="text-gray-400 text-sm mt-1 max-w-sm">
                Nessun utente corrisponde al filtro &quot;{
                    filter === 'user' ? 'Utenti' : filter === 'moderator' ? 'Moderatori' : filter === 'admin' ? 'Amministratori' : 'Null'
                }&quot;.
            </p>
            <button
                onClick={() => handleClick?.(givenStr)}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-all cursor-pointer"
            >
                Mostra tutti gli utenti
            </button>
        </div>
    )
}

const emptyStates: (({ filter, givenStr, onClick }: Props) => React.ReactElement)[] = [TotalEmptyState, FilterEmptyState];

export default emptyStates;