import TaskRow from "./TaskRow";
import type { Task } from "../types/Task.ts";
import { StorageService } from "../services/StorageService.tsx";

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
        <div>
            {tasks.map(task => (
                <TaskRow
                    key={task.id}
                    task={task}
                    onUpdate={handleTaskUpdate}
                />
            ))}
        </div>
    );
}