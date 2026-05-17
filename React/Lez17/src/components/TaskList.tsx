import React, { useState } from "react";
import TaskRow from "./TaskRow";
import type { Task } from "../types/Task.ts";

type Props = {
    tasks: Task[];
    onChange: (newTasks: Task[]) => void;
}

export default function TaskList({ tasks }: Props) {
    return (
        <div>
            {tasks.map(task => (
                <TaskRow key={task.id} task={task} />
            ))}
        </div>
    );
}