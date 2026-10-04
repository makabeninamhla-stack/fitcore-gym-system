import React, { useEffect, useState } from 'react';
import {
    Table, Card, Form, Alert, Spinner
} from 'react-bootstrap';

const statuses = ['Not Started', 'In Progress', 'Completed'];

async function taskRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    const text = await response.text();

    if (!response.ok) {
        let message = text;

        try {
            const details = JSON.parse(text);
            message = details.errors
                ? Object.values(details.errors).flat().join(' ')
                : details.detail || details.title || text;
        } catch {
            // The backend may return a plain-text error.
        }

        if (response.status === 401) {
            message = 'Please sign in again.';
        } else if (response.status === 403) {
            message = 'Please sign in with a Gym Member account.';
        }

        throw new Error(
            message || `Request failed (${response.status}).`
        );
    }

    return text ? JSON.parse(text) : null;
}

export default function MemberTasks() {
    const [tasks, setTasks] = useState([]);
    const [filterStatus, setFilterStatus] = useState('All');
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function loadTasks() {
            try {
                const data = await taskRequest(
                    '/api/member/workout-tasks'
                );

                if (!cancelled) setTasks(data);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadTasks();

        return () => {
            cancelled = true;
        };
    }, []);

    async function updateStatus(id, status) {
        setSavingId(id);
        setError('');
        setMessage('');

        try {
            const updated = await taskRequest(
                `/api/member/workout-tasks/${id}/status`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ status })
                }
            );

            setTasks(previous =>
                previous.map(task =>
                    task.workoutTaskId === updated.workoutTaskId
                        ? { ...task, status: updated.status }
                        : task
                )
            );

            setMessage('Workout status saved successfully.');
        } catch (err) {
            setError(err.message);
        } finally {
            setSavingId(null);
        }
    }

    const filteredTasks = tasks.filter(task =>
        filterStatus === 'All' || task.status === filterStatus
    );

    return (
        <div>
            <h2 className="mb-4 text-white">
                My Workout Tasks
            </h2>

            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}

            <Card className="bg-dark border-danger text-white">
                <Card.Header className="bg-danger fw-bold">
                    Assigned Workout Tasks
                </Card.Header>

                <Card.Body>
                    <Form.Group className="mb-4">
                        <Form.Label>Filter by Status</Form.Label>
                        <Form.Select
                            value={filterStatus}
                            onChange={e => {
                                setFilterStatus(e.target.value);
                                setMessage('');
                            }}
                            className="bg-dark text-white border-secondary"
                        >
                            <option value="All">All</option>
                            {statuses.map(status => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {loading ? (
                        <Spinner animation="border" variant="danger" />
                    ) : (
                        <Table
                            striped
                            bordered
                            hover
                            responsive
                            variant="dark"
                        >
                            <thead>
                                <tr>
                                    <th>Workout Plan</th>
                                    <th>Exercise</th>
                                    <th>Description</th>
                                    <th>Sets</th>
                                    <th>Repetitions</th>
                                    <th>Workout Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredTasks.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center">
                                            {error && tasks.length === 0
                                                ? 'Workout tasks could not be loaded.'
                                                : 'No workout tasks match this filter.'}
                                        </td>
                                    </tr>
                                ) : filteredTasks.map(task => (
                                    <tr key={task.workoutTaskId}>
                                        <td>{task.planName}</td>
                                        <td>{task.exerciseName}</td>
                                        <td>{task.description}</td>
                                        <td>{task.numberOfSets}</td>
                                        <td>{task.numberOfRepetitions}</td>
                                        <td>
                                            {task.workoutDate
                                                ?.slice(0, 16)
                                                .replace('T', ' ')}
                                        </td>
                                        <td>
                                            <Form.Select
                                                aria-label={`Status for ${task.exerciseName}`}
                                                value={task.status}
                                                disabled={savingId !== null}
                                                onChange={e =>
                                                    updateStatus(
                                                        task.workoutTaskId,
                                                        e.target.value
                                                    )
                                                }
                                                className="bg-dark text-white border-secondary"
                                            >
                                                {!statuses.includes(task.status) && (
                                                    <option value={task.status}>
                                                        {task.status}
                                                    </option>
                                                )}

                                                {statuses.map(status => (
                                                    <option
                                                        key={status}
                                                        value={status}
                                                    >
                                                        {status}
                                                    </option>
                                                ))}
                                            </Form.Select>

                                            {savingId === task.workoutTaskId && (
                                                <small className="d-block mt-1">
                                                    Saving...
                                                </small>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
}