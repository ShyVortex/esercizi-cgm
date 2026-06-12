import { TotalEmptyState } from "@/app/components/EmptyState";

export default function NotFound() {
    return (
        <TotalEmptyState
            title="Utente non trovato"
            description="L'utente richiesto non esiste o è stato rimosso."
        />
    );
}
