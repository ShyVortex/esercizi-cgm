import { TotalEmptyState } from "@/app/components/EmptyState";

export default function NotFound() {
    return (
        <TotalEmptyState
            title="Progetto non trovato"
            description="Il progetto richiesto non esiste o è stato rimosso."
        />
    );
}
