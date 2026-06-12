"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import StateModal from "./StateModal";
import { State } from "@/models/types/Task";

type Props = {
    stateToEdit?: State | null;
}

export default function StateModalWrapper({ stateToEdit }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const modal = searchParams.get("modal");

    const isOpen = modal === "create" || modal === "edit";

    const handleClose = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("modal");
        params.delete("editStateId");
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <StateModal
            key={modal === "edit" ? `edit-${stateToEdit?.id}` : "create"}
            isOpen={isOpen}
            onClose={handleClose}
            state={modal === "edit" ? stateToEdit : null}
        />
    );
}
