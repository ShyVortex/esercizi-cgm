"use client";

import { useEffect, useTransition, useState } from "react";
import { useRouter } from "next/navigation";

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isRetrying, setIsRetrying] = useState(false);

    useEffect(() => {
        console.error("Errore catturato:", error);
    }, [error]);

    const handleRetry = () => {
        setIsRetrying(true);
        startTransition(() => {
            router.refresh();
        });
    };

    useEffect(() => {
        (async () => {
            if (isRetrying && !isPending) {
                setIsRetrying(false);
                reset();
            }
        })();
    }, [isPending, isRetrying, reset]);

    return (
        <div className="p-6 bg-red-950/40 border border-red-500/30 rounded-lg text-center space-y-4">
            <h2 className="text-red-400 text-xl font-bold">Si è verificato un errore temporaneo</h2>
            <p className="text-gray-300 text-sm">
                {error.message || "Impossibile recuperare le informazioni sul prodotto."}
            </p>
            <button
                onClick={handleRetry}
                disabled={isPending}
                className="px-4 py-2 bg-red-700 hover:bg-red-650 disabled:bg-red-900/40 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors cursor-pointer"
            >
                {isPending ? "Riprova in corso..." : "Riprova"}
            </button>
        </div>
    );
}
