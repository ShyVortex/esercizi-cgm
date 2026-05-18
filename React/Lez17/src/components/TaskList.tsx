import TaskRow from "./TaskRow";
import type { Task } from "../types/Task.ts";
import { StorageService } from "../services/StorageService.ts";

type Props = {
    tasks: Task[];
    onChange: (newTasks: Task[]) => void;
}

export default function TaskList({ tasks, onChange }: Props) {
    const handleTaskUpdate = (updatedTask: Task) => {
        // Creiamo un nuovo array sostituendo solo la task modificata
        const newTasks = StorageService.loadTasks().map(task =>
            task.id === updatedTask.id ? updatedTask : task
        );

        // Torniamo al componente padre (App) per aggiornare la lista di attività
        onChange(newTasks);
    };

    return (
        <div id="tableContainer" className="rounded shadow overflow-hidden">
            <table className="w-full text-left border-collapse bg-gray-800">
                <thead className="bg-gray-500">
                    <tr id="tableHead">
                        <th className="p-4 border-b uppercase text-xs text-gray-900 font-bold">Task ID</th>
                        <th className="p-4 border-b uppercase text-xs text-gray-900 font-bold">Descrizione</th>
                        <th className="p-4 border-b uppercase text-xs text-gray-900 font-bold">Stato</th>
                        <th className="p-4 border-b uppercase text-right text-xs text-gray-900 font-bold">Azione</th>
                    </tr>
                </thead>
                <tbody id="tableBody">
                    {tasks.map(task => (
                        <TaskRow
                            key={task.id}
                            task={task}
                            onUpdate={handleTaskUpdate}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}