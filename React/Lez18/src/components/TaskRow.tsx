import type { Task } from "../types/Task";

type Props = {
    task: Task;
    onUpdate: (newTask: Task) => void;
}

export default function TaskRow({ task, onUpdate }: Props) {
    const statusText: string = task.completed ? 'Completato' : 'Non completato';
    const actionText: string = task.completed ? 'Annulla' : 'Completa';

    const buttonClass: string = "p-2 w-20 text-sm bg-gray-400 hover:bg-gray-300 text-black font-medium rounded cursor-pointer";
    let statusClass: string;

    if (task.completed) {
        statusClass = "p-2 text-sm text-green-700 rounded";
    } else {
        statusClass = "p-2 text-sm text-red-700 rounded";
    }

    return (
        <tr className="border-b last:border-0">
            <td className="p-4 text-sm text-gray-300">{task.id}</td>
            <td className="p-4 text-sm text-gray-300">{task.description}</td>
            <td className={statusClass}>{statusText}</td>
            <td className="p-4 text-right space-x-2">
                <button
                    className={buttonClass}
                    onClick={() => {
                        const updatedTask: Task = { ...task, completed: !task.completed };
                        onUpdate(updatedTask);
                    }}
                >
                    {actionText}
                </button>
            </td>
        </tr>
    )
}   