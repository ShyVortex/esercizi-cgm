import React, { useState } from "react";
import type { Task } from "../types/Task";

export default function TaskRow({ task }: { task: Task }) {
    return (
        <div>
            <h2>Task {task.id}</h2>
            <h3>{task.description}</h3>
            <h4>Completed: {task.completed.toString()}</h4>
            <div style={{marginBottom: '20px'}}></div>
        </div>
    )
}