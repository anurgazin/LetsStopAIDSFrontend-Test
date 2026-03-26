'use client'
import React, { useCallback, useState, useEffect } from 'react';
import styles from './test.module.css';

// Your Test Starts Here
enum PriorityType {
    low = "Low",
    medium = "Medium",
    high = "High"
}
enum Status {
    completed = "Completed",
    active = "Active"
}
type Task = {
    title: string,
    priority: PriorityType,
    status: Status
}

export default function TaskManager(): JSX.Element {
    // Base Variables
    const [title, setTitle] = useState<string>("");
    const [priority, setPriority] = useState<PriorityType>(PriorityType.low);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [error, setError] = useState<string>("");
    // Edit Variables
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    // Filter Variables
    const [filter, setFilter] = useState<"all" | Status>("all");
    // Search Variable
    const [search, setSearch] = useState<string>("");

    // LocalStorage handling(fetching/changing) 
    useEffect(() => {
        const storedTasks = localStorage.getItem("tasks");
        if (storedTasks) {
            try {
                setTasks(JSON.parse(storedTasks));
            } catch (err) {
                console.error("Failed to parse tasks:", err);
            }
        }
    }, []);
    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    // Tasks handling
    const handleTitle = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value), []);
    const handlePriority = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value as PriorityType), []);

    const handleCheck = (index: number) => {
        setTasks((prev) =>
            prev.map((task, i) =>
                i === index
                    ? {
                        ...task,
                        status:
                            task.status === Status.completed
                                ? Status.active
                                : Status.completed
                    }
                    : task
            )
        );
    };

    const handleDelete = (index: number) => {
        setTasks((prev) => prev.filter((_, i) => i !== index));
    };

    const handleIsEdit = (task: Task, index: number) => {
        setIsEdit(true);
        setEditIndex(index);
        setTitle(task.title);
        setPriority(task.priority);
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (title.trim() === "") {
            setError("Title is empty");
            return;
        }

        if (isEdit && editIndex !== null) {
            setTasks(prev =>
                prev.map((task, i) =>
                    i === editIndex ? { ...task, title, priority } : task
                )
            );
            setIsEdit(false);
            setEditIndex(null);
        } else {
            const newTask: Task = {
                title: title,
                priority: priority,
                status: Status.active
            };
            setTasks((prev) => [newTask, ...prev]);
        }
        setTitle("");
        setPriority(PriorityType.low);
        setError("")
    }

    const handleCancel = () => {
        if (isEdit) {
            setIsEdit(false);
            setEditIndex(null);
        }
        setTitle("");
        setPriority(PriorityType.low);
        setError("");
    }

    // Display Tasks handling(filter and search)
    const handleFilter = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value as Status), []);

    const handleSearch = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value), []);

    return (
        <div className={styles.container}>
            <form className='task_form' onSubmit={handleSubmit}>
                <h4>{isEdit ? "Edit" : "Create"} Form</h4>
                {error && (<p>{error}</p>)}
                <div className='task_form_title'>
                    <label htmlFor='title'>Title</label>
                    <input type='text' name='title' id='title' value={title} onChange={handleTitle} />
                </div>
                <div className='task_form_priority'>
                    <label htmlFor='priority'>Priority</label>
                    <select name='priority' id='priority' value={priority} onChange={handlePriority}>
                        <option value={PriorityType.low}>Low</option>
                        <option value={PriorityType.medium}>Medium</option>
                        <option value={PriorityType.high}>High</option>
                    </select>
                </div>
                <div className='task_form_buttons'>
                    <button type='submit'>{isEdit ? "Save" : "Add task"}</button>
                    <button type='button' onClick={handleCancel}>Cancel</button>
                </div>
            </form>

            <div className='tasks'>
                <h4>Tasks:</h4>
                <div className='tasks_search'>
                    <label htmlFor="search">Search:</label>
                    <input type="text" name="search" id="search" value={search} onChange={handleSearch} />
                </div>
                <div className='task_filter'>
                    <label htmlFor='filter'>Filter</label>
                    <select name='filter' id='filter' value={filter} onChange={handleFilter}>
                        <option value={"all"}>All</option>
                        <option value={Status.active}>Active</option>
                        <option value={Status.completed}>Completed</option>
                    </select>
                </div>
                {tasks
                    .map((task, index) => ({ task, index }))
                    .filter(({ task }) =>
                        filter === "all" ? true : task.status === filter
                    )
                    .filter(({ task }) =>
                        task.title.toLowerCase().includes(search.toLowerCase())
                    )
                    .sort((a, b) => {
                        if (a.task.status === b.task.status) return 0;
                        return a.task.status === Status.active ? -1 : 1;
                    })
                    .map(({ task, index }) => (
                        <div key={index}>
                            <p>{task.title} {task.priority}</p>
                            <div>
                                <label htmlFor="status">Status: </label>
                                <input type="checkbox" name="status" id="status" onChange={() => handleCheck(index)} checked={task.status === Status.completed} />
                            </div>
                            <div className='tasks_buttons'>
                                <button onClick={() => handleDelete(index)}>Delete</button>
                                <button onClick={() => handleIsEdit(task, index)}>Edit</button>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};