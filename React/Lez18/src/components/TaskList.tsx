import TaskRow from "./TaskRow";
import type { Task } from "../types/Task.ts";

type Props = {
    tasks: Task[];
    onChange: (updatedTask: Task) => void;
}

export default function TaskList({ tasks, onChange }: Props) {
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
                            onUpdate={onChange}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}