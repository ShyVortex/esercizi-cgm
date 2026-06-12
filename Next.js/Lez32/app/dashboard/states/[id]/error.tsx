"use client";

import { useEffect } from "react";
import ErrorState from "@/app/components/ErrorState";

export default function ErrorBoundary({
    error
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Errore stato catturato:", error);
    }, [error]);

    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <ErrorState
            title="Si è verificato un errore nel caricamento dello stato"
            message={error.message}
            btnText="Riprova"
            onClick={handleRetry}
        />
    );
}
