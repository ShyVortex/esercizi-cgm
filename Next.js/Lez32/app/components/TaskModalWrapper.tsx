"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import TaskModal from "./TaskModal";
import { Task } from "@/models/types/Task";

type Props = {
    taskToEdit?: Task | null;
}

export default function TaskModalWrapper({ taskToEdit }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const modal = searchParams.get("modal");

    const isOpen = modal === "create" || modal === "edit";

    const handleClose = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("modal");
        params.delete("editTaskId");
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <TaskModal
            key={modal === "edit" ? `edit-${taskToEdit?.id}` : "create"}
            isOpen={isOpen}
            onClose={handleClose}
            task={modal === "edit" ? taskToEdit : null}
        />
    );
}
