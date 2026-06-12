"use client";

interface ErrorTriggerProps {
    message: string;
}

export default function ErrorTrigger({ message }: ErrorTriggerProps): never {
    throw new Error(message);
}
