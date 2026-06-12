"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ProjectModal from "./ProjectModal";
import { Project } from "@/models/types/Project";

type Props = {
    projectToEdit?: Project | null;
}

export default function ProjectModalWrapper({ projectToEdit }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const modal = searchParams.get("modal");

    const isOpen = modal === "create" || modal === "edit";

    const handleClose = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("modal");
        params.delete("editProjectId");
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <ProjectModal
            key={modal === "edit" ? `edit-${projectToEdit?.id}` : "create"}
            isOpen={isOpen}
            onClose={handleClose}
            project={modal === "edit" ? projectToEdit : null}
        />
    );
}
