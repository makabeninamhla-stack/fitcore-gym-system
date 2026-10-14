import React, { useEffect, useState } from 'react';
import {
    Table, Button, Modal, Form, Spinner, Alert
} from 'react-bootstrap';
import { Link } from 'react-router-dom';

const blank = {
    memberId: '',
    programmeId: '',
    planName: ''
};

async function request(url, options = {}) {
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
            // The API may return plain text.
        }

        if (response.status === 401) {
            message = 'Please sign in again.';
        } else if (response.status === 403) {
            message = 'Please sign in with a Personal Trainer account.';
        }

        throw new Error(
            message || `Request failed (${response.status}).`
        );
    }

    return text ? JSON.parse(text) : null;
}

export default function TrainerPlans() {
    const [plans, setPlans] = useState([]);
    const [members, setMembers] = useState([]);
    const [programmes, setProgrammes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingProgrammes, setLoadingProgrammes] = useState(false);
    const [show, setShow] = useState(false);
    const [saving, setSaving] = useState(false);
    const [validated, setValidated] = useState(false);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');
    const [message, setMessage] = useState('');
    const [f, setF] = useState({ ...blank });

    const inputClass = 'bg-dark text-white border-secondary';

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const [memberData, planData] = await Promise.all([
                    request('/api/trainer/members'),
                    request('/api/trainer/workout-plans')
                ]);

                if (!cancelled) {
                    setMembers(memberData);
                    setPlans(planData);
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
    }, []);

    useEffect(() => {
        let cancelled = false;

        setProgrammes([]);
        setLoadingProgrammes(Boolean(f.memberId));

        if (!f.memberId) {
            return () => {
                cancelled = true;
            };
        }

        async function loadProgrammes() {
            try {
                const data = await request(
                    `/api/trainer/members/${f.memberId}/programmes`
                );

                if (!cancelled) setProgrammes(data);
            } catch (err) {
                if (!cancelled) setFormError(err.message);
            } finally {
                if (!cancelled) setLoadingProgrammes(false);
            }
        }

        loadProgrammes();

        return () => {
            cancelled = true;
        };
    }, [f.memberId]);

    function open() {
        setF({ ...blank });
        setProgrammes([]);
        setValidated(false);
        setFormError('');
        setShow(true);
    }

    async function submit(event) {
        event.preventDefault();

        if (!event.currentTarget.checkValidity()) {
            setValidated(true);
            return;
        }

        setSaving(true);
        setFormError('');
        setMessage('');

        try {
            await request('/api/trainer/workout-plans', {
                method: 'POST',
                body: JSON.stringify({
                    planName: f.planName.trim(),
                    memberId: Number(f.memberId),
                    programmeId: Number(f.programmeId)
                })
            });

            setShow(false);
            setMessage('Workout plan created successfully.');

            try {
                setPlans(await request('/api/trainer/workout-plans'));
                setError('');
            } catch (err) {
                setError(
                    `Plan created, but the list could not refresh: ${err.message}`
                );
            }
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div>
            <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-4">
                <h2 className="text-white mb-0">Workout Plans</h2>
                <Button
                    variant="danger"
                    onClick={open}
                    disabled={loading || members.length === 0}
                >
                    + Create Plan
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}

            {!loading && !error && members.length === 0 && (
                <Alert variant="dark" className="border-secondary">
                    The administrator must assign a member to you
                    before you can create a workout plan.
                </Alert>
            )}

            {loading ? (
                <Spinner animation="border" variant="danger" />
            ) : (
                <Table variant="dark" striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Plan ID</th>
                            <th>Plan Name</th>
                            <th>Member</th>
                            <th>Programme</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plans.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    No workout plans loaded.
                                </td>
                            </tr>
                        ) : plans.map(plan => (
                            <tr key={plan.workoutPlanId}>
                                <td>{plan.workoutPlanId}</td>
                                <td>{plan.planName}</td>
                                <td>{plan.memberName}</td>
                                <td>{plan.programmeName}</td>
                                <td>
                                    <Link
                                        to={`/trainer/plans/${plan.workoutPlanId}/tasks`}
                                        className="btn btn-outline-danger btn-sm"
                                    >
                                        Manage Exercises
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

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
                        <Modal.Title>Create Workout Plan</Modal.Title>
                    </Modal.Header>

                    <Modal.Body className="bg-dark text-white">
                        {formError && (
                            <Alert variant="danger">{formError}</Alert>
                        )}

                        <fieldset disabled={saving}>
                            <Form.Group className="mb-3">
                                <Form.Label>Plan Name</Form.Label>
                                <Form.Control
                                    required
                                    value={f.planName}
                                    onChange={e => setF({
                                        ...f,
                                        planName: e.target.value
                                    })}
                                    className={inputClass}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Gym Member</Form.Label>
                                <Form.Select
                                    required
                                    value={f.memberId}
                                    onChange={e => {
                                        setF({
                                            ...f,
                                            memberId: e.target.value,
                                            programmeId: ''
                                        });
                                        setFormError('');
                                    }}
                                    className={inputClass}
                                >
                                    <option value="">Choose a member...</option>
                                    {members.map(member => (
                                        <option
                                            key={member.memberId}
                                            value={member.memberId}
                                        >
                                            {member.memberNumber} — {member.name} {member.surname}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Assigned Programme</Form.Label>
                                <Form.Select
                                    required
                                    value={f.programmeId}
                                    disabled={!f.memberId || loadingProgrammes}
                                    onChange={e => setF({
                                        ...f,
                                        programmeId: e.target.value
                                    })}
                                    className={inputClass}
                                >
                                    <option value="">
                                        {loadingProgrammes
                                            ? 'Loading programmes...'
                                            : 'Choose a programme...'}
                                    </option>
                                    {programmes.map(programme => (
                                        <option
                                            key={programme.programmeId}
                                            value={programme.programmeId}
                                        >
                                            {programme.programmeName}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            {f.memberId &&
                                !loadingProgrammes &&
                                !formError &&
                                programmes.length === 0 && (
                                    <Alert variant="warning">
                                        This member has no assigned programmes.
                                        An administrator must assign one first.
                                    </Alert>
                                )}
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
                            disabled={
                                saving ||
                                loadingProgrammes ||
                                !f.memberId ||
                                !f.programmeId
                            }
                        >
                            {saving ? 'Saving...' : 'Create Plan'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}