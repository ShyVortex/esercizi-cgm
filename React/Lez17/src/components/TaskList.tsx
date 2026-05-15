import React, { useState } from "react";
import TaskRow from "./TaskRow";

export default function TaskList({ tasks }) {
    return (
        <div>
            {tasks.map(task => (
                <TaskRow key={task.id} task={task} />
            ))}
        </div>
    );
}