import { TotalEmptyState } from "@/app/components/EmptyState";

export default function NotFound() {
    return (
        <TotalEmptyState
            title="Stato non trovato"
            description="Lo stato richiesto non esiste o è stato rimosso."
        />
    );
}
