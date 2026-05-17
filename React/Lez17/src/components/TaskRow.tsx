import type { Task } from "../types/Task";

type Props = {
    task: Task;
    onUpdate: (newTask: Task) => void;
}

export default function TaskRow({ task, onUpdate }: Props) {
    const text: string = task.completed ? 'Annulla completamento' : 'Completa attività';

    const buttonClass = "mt-1 px-2 text-black bg-gray-300 rounded-md shadow-sm border border-gray-300 transition-colors hover:bg-white";

    return (
        <div>
            <h2>Task {task.id}</h2>
            <h3>{task.description}</h3>
            <h4>Completed: {task.completed.toString()}</h4>
            <button
                className={buttonClass}
                onClick={() => {
                    const updatedTask: Task = { ...task, completed: !task.completed };
                    onUpdate(updatedTask);
                }}
            >
                {text}
            </button>
            <div style={{ marginBottom: '20px' }}></div>
        </div>
    )
}   