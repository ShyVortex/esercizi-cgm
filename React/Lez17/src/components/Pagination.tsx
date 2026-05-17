import React, { useState, useEffect } from 'react';

type Props = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function PaginationComponent({
    currentPage,
    totalPages,
    onPageChange
}: Props): React.ReactElement {

    // Stato locale input: permette digitazione da parte dell'utente
    const [inputValue, setInputValue] = useState<string>(currentPage.toString());

    // Sincronizza l'input se currentPage cambia dall'esterno
    useEffect(() => {
        setInputValue(currentPage.toString());
    }, [currentPage]);

    // Logica di navigazione
    const goToPage = (page: number) => {
        let targetPage = page;
        if (targetPage < 1) targetPage = 1;
        if (targetPage > totalPages) targetPage = totalPages;

        if (targetPage !== currentPage) {
            onPageChange(targetPage);
        } else {
            // Re-render visuale in caso di valore non valido
            setInputValue(currentPage.toString());
        }
    };

    // Gestione dell'input testuale
    const handleInputBlur = () => {
        const val = parseInt(inputValue, 10);
        if (!isNaN(val)) {
            goToPage(val);
        } else {
            setInputValue(currentPage.toString());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleInputBlur();
    };

    // Gestione dinamica delle classi Tailwind
    const getButtonClasses = (isDisabled: boolean) => {
        const baseClasses = "px-3 py-1 border rounded transition-colors ";
        if (isDisabled) {
            return baseClasses + "opacity-40 cursor-not-allowed bg-gray-100";
        }
        return baseClasses + "hover:bg-gray-200 text-blue-600";
    };

    return (
        <div className="flex items-center gap-2 mt-5 justify-center align-center mb-2">
            <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className={getButtonClasses(currentPage === 1)}
            >
                1
            </button>

            <button
                onClick={() => goToPage(currentPage - 10)}
                disabled={currentPage <= 10}
                className={getButtonClasses(currentPage <= 10)}
            >
                -10
            </button>

            <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={getButtonClasses(currentPage === 1)}
            >
                Prev
            </button>

            <div className="flex items-center gap-2 px-2">
                <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    className="w-16 text-center border rounded py-1"
                />
                <span className="text-gray-600">di {totalPages}</span>
            </div>

            <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={getButtonClasses(currentPage === totalPages)}
            >
                Next
            </button>

            <button
                onClick={() => goToPage(currentPage + 10)}
                disabled={currentPage > totalPages - 10}
                className={getButtonClasses(currentPage > totalPages - 10)}
            >
                +10
            </button>

            <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className={getButtonClasses(currentPage === totalPages)}
            >
                {totalPages}
            </button>
        </div>
    );
};