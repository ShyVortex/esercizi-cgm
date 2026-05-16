import React, { useState } from "react";
import TaskRow from "./TaskRow";
import type {Task} from "../types/Task.ts";

export default function TaskList({ tasks }: {tasks: Task[]}) {
    return (
        <div>
            {tasks.map(task => (
                <TaskRow key={task.id} task={task} />
            ))}
        </div>
    );
}