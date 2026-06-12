interface TotalEmptyStateProps {
    title?: string;
    description?: string;
    icon?: string;
}

export function TotalEmptyState({
    title = "Nessun dato presente",
    description = "La lista è vuota.\nNon ci sono risultati da visualizzare.",
    icon = "📝"
}: TotalEmptyStateProps): React.ReactElement {
    return (
        <div className="flex flex-col my-auto self-center items-center justify-center p-12 bg-gray-800/40 rounded-xl border border-gray-700/50 shadow-md text-center">
            <div className="text-4xl mb-4">{icon}</div>
            <p className="text-gray-300 font-medium text-lg">{title}</p>
            <p className="text-gray-400 text-sm mt-1 max-w-sm whitespace-pre-line">{description}</p>
        </div>
    )
}

interface FilterEmptyStateProps {
    message?: string;
    buttonText?: string;
    onClick?: () => void;
}

export function FilterEmptyState({
    message = "Nessun risultato corrisponde ai filtri selezionati.",
    buttonText = "Reimposta filtri",
    onClick: handleClick
}: FilterEmptyStateProps): React.ReactElement {
    return (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-800/40 rounded-xl border border-gray-700/50 shadow-md text-center">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-300 font-medium text-lg">Nessun risultato trovato</p>
            <p className="text-gray-400 text-sm mt-1 max-w-sm">
                {message}
            </p>
            {handleClick && (
                <button
                    onClick={handleClick}
                    className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-all cursor-pointer"
                >
                    {buttonText}
                </button>
            )}
        </div>
    )
}