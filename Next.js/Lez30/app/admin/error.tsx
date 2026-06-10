"use client";

import { useEffect } from "react";
import ErrorState from "../components/ErrorState";

export default function ErrorBoundary({
    error
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Errore catturato:", error);
    }, [error]);

    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <ErrorState
            title="Si è verificato un errore"
            message={error.message}
            btnText="Riprova a caricare"
            onClick={handleRetry} />
    );
}
