"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import CustomModal from "./CustomModal";
import { User } from "@/models/types/User";

type Props = {
    userToEdit?: User | null;
}

export default function AdminModalWrapper({ userToEdit }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const modal = searchParams.get("modal");

    const isOpen = modal === "create" || modal === "edit";

    const handleClose = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("modal");
        params.delete("editUserId");
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <CustomModal
            key={modal === "edit" ? `edit-${userToEdit?.id}` : "create"}
            isOpen={isOpen}
            onClose={handleClose}
            user={modal === "edit" ? userToEdit : null}
        />
    );
}
