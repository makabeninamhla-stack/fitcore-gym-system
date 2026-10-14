import React, { useEffect, useState } from 'react';
import {
    Alert, Table, Button, Modal, Form,
    Row, Col, Badge, Card, Spinner
} from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { trainerService } from '../../services/trainerService';

const blank = {
    exerciseName: '',
    description: '',
    sets: 3,
    reps: 10,
    dueDate: ''
};

const colors = {
    'Not Started': 'secondary',
    'In Progress': 'warning',
    Complete: 'success'
};

export default function TrainerTasks() {
    const { planId: routePlanId } = useParams();
    const planId = Number(routePlanId);

    const [plan, setPlan] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [show, setShow] = useState(false);
    const [validated, setValidated] = useState(false);
    const [editId, setEditId] = useState(null);
    const [f, setF] = useState({ ...blank });
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    const inp = 'bg-dark text-white border-secondary';

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError('');
            setPlan(null);
            setTasks([]);

            try {
                if (!Number.isInteger(planId) || planId < 1) {
                    throw new Error('Invalid workout plan ID.');
                }

                const selectedPlan = await trainerService.getPlan(planId);

                if (cancelled) return;

                setPlan(selectedPlan);

                if (selectedPlan) {
                    const data = await trainerService.getTasks(planId);
                    if (!cancelled) setTasks(data);
                }
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [planId]);

    function open(task = null) {
        setEditId(task ? task.id : null);
        setF(task ? {
            exerciseName: task.exerciseName || '',
            description: task.description || '',
            sets: task.sets,
            reps: task.reps,
            dueDate: task.dueDate?.slice(0, 16) || ''
        } : { ...blank });

        setValidated(false);
        setFormError('');
        setShow(true);
    }

    async function refreshTasks() {
        try {
            setTasks(await trainerService.getTasks(planId));
        } catch (err) {
            setError(
                `Change saved, but could not refresh exercises: ${err.message}`
            );
        }
    }

    async function submit(event) {
        event.preventDefault();

        if (!event.currentTarget.checkValidity()) {
            setValidated(true);
            return;
        }

        setSaving(true);
        setFormError('');
        setError('');

        try {
            await trainerService.saveTask({
                ...f,
                planId,
                sets: Number(f.sets),
                reps: Number(f.reps)
            }, editId);

            setShow(false);
            await refreshTasks();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function remove(id) {
        if (!window.confirm('Delete this workout task?')) return;

        setSaving(true);
        setError('');

        try {
            await trainerService.deleteTask(id, planId);
            await refreshTasks();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    const shown = tasks.filter(
        task => filter === 'All' || task.status === filter
    );

    if (loading) {
        return <Spinner animation="border" variant="danger" />;
    }

    return (
        <div>
            <Link to="/trainer/plans" className="text-danger">
                &larr; Back to Workout Plans
            </Link>

            {error && (
                <Alert variant="danger" className="mt-3">
                    {error}
                </Alert>
            )}

            {!plan ? (
                !error && (
                    <p className="text-white mt-3">
                        Workout plan not found.
                    </p>
                )
            ) : (
                <>
                    <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center my-3">
                        <h2 className="text-white mb-0">
                            {plan.planCode} · {plan.planName}
                            <small className="d-block text-white-50 fs-5">
                                {plan.memberName}
                            </small>
                        </h2>

                        <Button
                            variant="danger"
                            onClick={() => open()}
                            disabled={saving}
                        >
                            + Add Task
                        </Button>
                    </div>

                    <Card className="mb-4 bg-dark border-secondary">
                        <Card.Body>
                            <Form.Label className="text-white">
                                Filter by Status
                            </Form.Label>
                            <Form.Select
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                                className={inp}
                            >
                                <option>All</option>
                                <option>Not Started</option>
                                <option>In Progress</option>
                                <option>Complete</option>
                            </Form.Select>
                        </Card.Body>
                    </Card>

                    <Table variant="dark" striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Exercise</th>
                                <th>Description</th>
                                <th>Sets</th>
                                <th>Reps</th>
                                <th>Workout Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shown.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center">
                                        No tasks found.
                                    </td>
                                </tr>
                            ) : shown.map(task => (
                                <tr key={task.id}>
                                    <td>{task.taskCode}</td>
                                    <td>{task.exerciseName}</td>
                                    <td>{task.description}</td>
                                    <td>{task.sets}</td>
                                    <td>{task.reps}</td>
                                    <td>
                                        {task.dueDate?.replace('T', ' ')}
                                    </td>
                                    <td>
                                        <Badge
                                            bg={colors[task.status] || 'secondary'}
                                            text={
                                                task.status === 'In Progress'
                                                    ? 'dark'
                                                    : 'light'
                                            }
                                        >
                                            {task.status}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <Button
                                                variant="outline-light"
                                                size="sm"
                                                onClick={() => open(task)}
                                                disabled={saving}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => remove(task.id)}
                                                disabled={saving}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <Modal
                        show={show}
                        onHide={() => {
                            if (!saving) setShow(false);
                        }}
                        size="lg"
                    >
                        <Form
                            noValidate
                            validated={validated}
                            onSubmit={submit}
                        >
                            <Modal.Header
                                closeButton={!saving}
                                closeVariant="white"
                                className="bg-danger text-white border-bottom-0"
                            >
                                <Modal.Title>
                                    {editId !== null
                                        ? 'Update Task'
                                        : 'Add Workout Task'}
                                </Modal.Title>
                            </Modal.Header>

                            <Modal.Body className="bg-dark text-white">
                                {formError && (
                                    <Alert variant="danger">
                                        {formError}
                                    </Alert>
                                )}

                                <fieldset disabled={saving}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Exercise Name</Form.Label>
                                        <Form.Control
                                            required
                                            value={f.exerciseName}
                                            onChange={e => setF({
                                                ...f,
                                                exerciseName: e.target.value
                                            })}
                                            className={inp}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control
                                            required
                                            as="textarea"
                                            rows={2}
                                            value={f.description}
                                            onChange={e => setF({
                                                ...f,
                                                description: e.target.value
                                            })}
                                            className={inp}
                                        />
                                    </Form.Group>

                                    <Row>
                                        <Form.Group as={Col} md={6} className="mb-3">
                                            <Form.Label>Number of Sets</Form.Label>
                                            <Form.Control
                                                required
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={f.sets}
                                                onChange={e => setF({
                                                    ...f,
                                                    sets: e.target.value
                                                })}
                                                className={inp}
                                            />
                                        </Form.Group>

                                        <Form.Group as={Col} md={6} className="mb-3">
                                            <Form.Label>
                                                Number of Repetitions
                                            </Form.Label>
                                            <Form.Control
                                                required
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={f.reps}
                                                onChange={e => setF({
                                                    ...f,
                                                    reps: e.target.value
                                                })}
                                                className={inp}
                                            />
                                        </Form.Group>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            Workout Date and Time
                                        </Form.Label>
                                        <Form.Control
                                            required
                                            type="datetime-local"
                                            value={f.dueDate}
                                            onChange={e => setF({
                                                ...f,
                                                dueDate: e.target.value
                                            })}
                                            className={inp}
                                        />
                                    </Form.Group>
                                </fieldset>
                            </Modal.Body>

                            <Modal.Footer className="bg-dark border-top-0">
                                <Button
                                    variant="secondary"
                                    onClick={() => setShow(false)}
                                    disabled={saving}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    type="submit"
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save Task'}
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
                </>
            )}
        </div>
    );
}