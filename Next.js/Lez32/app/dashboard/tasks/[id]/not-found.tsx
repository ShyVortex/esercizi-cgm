import { TotalEmptyState } from "@/app/components/EmptyState";

export default function NotFound() {
    return (
        <TotalEmptyState
            title="Attività non trovata"
            description="L'attività richiesta non esiste o è stata rimossa."
        />
    );
}
