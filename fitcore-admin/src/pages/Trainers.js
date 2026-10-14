import React, { useEffect, useState } from 'react';
import {
    Alert, Button, Card, Col, Form,
    Modal, Row, Spinner, Table
} from 'react-bootstrap';
import { apiService } from '../services/apiService';

const blank = {
    staffNumber: '',
    name: '',
    surname: '',
    gender: '',
    email: '',
    phone: '',
    specialization: 'Weight Training'
};

const inputClass = 'bg-dark text-white border-secondary';

async function createTrainerAccount(id, password) {
    const response = await fetch(
        `/api/ProfileAccounts/trainers/${id}`,
        {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        }
    );

    const text = await response.text();
    let result = text;

    try {
        result = text ? JSON.parse(text) : null;
    } catch {
        // Some API errors are plain text.
    }

    if (!response.ok) {
        let message = typeof result === 'string'
            ? result
            : Array.isArray(result)
                ? result.join(' ')
                : result?.errors
                    ? Object.values(result.errors).flat().join(' ')
                    : result?.detail || result?.title;

        if (response.status === 401) {
            message = 'Please sign in again.';
        } else if (response.status === 403) {
            message = 'Only an Administrator can create login accounts.';
        }

        throw new Error(
            message || `Account creation failed (${response.status}).`
        );
    }

    return result;
}

export default function Trainers() {
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [validated, setValidated] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({ ...blank });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [accountTrainer, setAccountTrainer] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [accountError, setAccountError] = useState('');
    const [creatingAccount, setCreatingAccount] = useState(false);
    const [createdAccountIds, setCreatedAccountIds] = useState([]);

    useEffect(() => {
        let cancelled = false;

        apiService.getTrainers()
            .then(data => {
                if (!cancelled) setTrainers(data);
            })
            .catch(err => {
                if (!cancelled) setError(err.message);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    async function loadTrainers() {
        setLoading(true);

        try {
            setTrainers(await apiService.getTrainers());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function openTrainer(trainer = null) {
        setCurrentId(trainer ? trainer.id : null);
        setFormData(
            trainer ? { ...blank, ...trainer } : { ...blank }
        );
        setValidated(false);
        setFormError('');
        setShowModal(true);
    }

    function changeField(field) {
        return event => {
            setFormData(previous => ({
                ...previous,
                [field]: event.target.value
            }));
        };
    }

    async function saveTrainer(event) {
        event.preventDefault();
        setValidated(true);
        setFormError('');

        if (!event.currentTarget.checkValidity()) return;

        setSaving(true);

        try {
            if (currentId !== null) {
                await apiService.updateTrainer(currentId, formData);
            } else {
                await apiService.addTrainer(formData);
            }

            setShowModal(false);
            setError('');
            setMessage('Trainer saved successfully.');
            await loadTrainers();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function deleteTrainer(id) {
        if (!window.confirm('Delete this Personal Trainer?')) return;

        setError('');
        setMessage('');
        setDeletingId(id);

        try {
            await apiService.deleteTrainer(id);
            setMessage('Trainer deleted successfully.');
            await loadTrainers();
        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingId(null);
        }
    }

    function openAccount(trainer) {
        setAccountTrainer(trainer);
        setPassword('');
        setConfirmPassword('');
        setAccountError('');
    }

    function closeAccount() {
        if (creatingAccount) return;

        setAccountTrainer(null);
        setPassword('');
        setConfirmPassword('');
        setAccountError('');
    }

    async function saveAccount(event) {
        event.preventDefault();
        setAccountError('');

        if (password !== confirmPassword) {
            setAccountError('Passwords do not match.');
            return;
        }

        setCreatingAccount(true);

        try {
            await createTrainerAccount(accountTrainer.id, password);

            setCreatedAccountIds(previous => [
                ...previous,
                accountTrainer.id
            ]);

            setMessage(
                `Login account created for ${accountTrainer.email}. ` +
                'They can now sign in as a Personal Trainer.'
            );
            setError('');
            setAccountTrainer(null);
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setAccountError(err.message);
        } finally {
            setCreatingAccount(false);
        }
    }

    const filteredTrainers = trainers.filter(trainer =>
        [trainer.staffNumber, trainer.name, trainer.surname]
            .some(value =>
                String(value || '').toLowerCase()
                    .includes(searchQuery.trim().toLowerCase())
            )
    );

    return (
        <div>
            <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-4">
                <h2 className="text-white mb-0">Personal Trainers</h2>
                <Button variant="danger" onClick={() => openTrainer()}>
                    + Add Trainer
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {message && (
                <Alert
                    variant="success"
                    dismissible
                    onClose={() => setMessage('')}
                >
                    {message}
                </Alert>
            )}

            <Card className="mb-4 bg-dark border-secondary">
                <Card.Body>
                    <Form.Control
                        type="search"
                        value={searchQuery}
                        onChange={event => setSearchQuery(event.target.value)}
                        placeholder="Search by Staff Number, Name, or Surname..."
                        aria-label="Search trainers"
                        className={inputClass}
                    />
                </Card.Body>
            </Card>

            {loading ? (
                <Spinner animation="border" variant="danger" />
            ) : (
                <Table variant="dark" striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Staff No.</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Specialization</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTrainers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center">
                                    No trainers found.
                                </td>
                            </tr>
                        ) : filteredTrainers.map(trainer => {
                            const hasAccount = Boolean(trainer.userId) ||
                                createdAccountIds.includes(trainer.id);

                            return (
                                <tr key={trainer.id}>
                                    <td>{trainer.staffNumber}</td>
                                    <td>{trainer.name} {trainer.surname}</td>
                                    <td>{trainer.email}</td>
                                    <td>{trainer.phone}</td>
                                    <td>{trainer.specialization}</td>
                                    <td>
                                        <div className="d-flex flex-wrap gap-2">
                                            <Button
                                                variant="outline-light"
                                                size="sm"
                                                onClick={() => openTrainer(trainer)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                disabled={deletingId !== null}
                                                onClick={() => deleteTrainer(trainer.id)}
                                            >
                                                {deletingId === trainer.id
                                                    ? 'Deleting...'
                                                    : 'Delete'}
                                            </Button>
                                            <Button
                                                variant="outline-info"
                                                size="sm"
                                                disabled={hasAccount}
                                                onClick={() => openAccount(trainer)}
                                            >
                                                {hasAccount
                                                    ? 'Account Created'
                                                    : 'Create Login Account'}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            )}

            <Modal
                show={showModal}
                onHide={() => !saving && setShowModal(false)}
                size="lg"
                backdrop={saving ? 'static' : true}
                keyboard={!saving}
            >
                <Form
                    noValidate
                    validated={validated}
                    onSubmit={saveTrainer}
                >
                    <Modal.Header
                        closeButton={!saving}
                        closeVariant="white"
                        className="bg-danger text-white border-bottom-0"
                    >
                        <Modal.Title>
                            {currentId !== null
                                ? 'Update Trainer'
                                : 'Add Trainer'}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body className="bg-dark text-white">
                        {formError && (
                            <Alert variant="danger">{formError}</Alert>
                        )}

                        <fieldset disabled={saving}>
                            <Row>
                                {[
                                    ['staffNumber', 'Staff Number', 'text'],
                                    ['specialization', 'Specialization', 'text'],
                                    ['name', 'Name', 'text'],
                                    ['surname', 'Surname', 'text'],
                                    ['email', 'Email', 'email'],
                                    ['phone', 'Phone Number', 'tel']
                                ].map(([field, label, type]) => (
                                    <Form.Group
                                        as={Col}
                                        md={6}
                                        className="mb-3"
                                        controlId={`trainer-${field}`}
                                        key={field}
                                    >
                                        <Form.Label>{label}</Form.Label>
                                        <Form.Control
                                            required
                                            type={type}
                                            value={formData[field] || ''}
                                            onChange={changeField(field)}
                                            className={inputClass}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            Enter a valid {label.toLowerCase()}.
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                ))}
                            </Row>

                            <Form.Group
                                className="mb-3"
                                controlId="trainer-gender"
                            >
                                <Form.Label>Gender</Form.Label>
                                <Form.Select
                                    required
                                    value={formData.gender}
                                    onChange={changeField('gender')}
                                    className={inputClass}
                                >
                                    <option value="">Select gender...</option>
                                    <option>Female</option>
                                    <option>Male</option>
                                    <option>Prefer not to say</option>
                                    <option>Other</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    Select a gender.
                                </Form.Control.Feedback>
                            </Form.Group>
                        </fieldset>
                    </Modal.Body>

                    <Modal.Footer className="bg-dark border-top-0">
                        <Button
                            variant="secondary"
                            disabled={saving}
                            onClick={() => setShowModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            type="submit"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Trainer'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <Modal
                show={accountTrainer !== null}
                onHide={closeAccount}
                backdrop={creatingAccount ? 'static' : true}
                keyboard={!creatingAccount}
            >
                <Form onSubmit={saveAccount}>
                    <Modal.Header
                        closeButton={!creatingAccount}
                        closeVariant="white"
                        className="bg-danger text-white"
                    >
                        <Modal.Title>Create Trainer Login Account</Modal.Title>
                    </Modal.Header>

                    <Modal.Body className="bg-dark text-white">
                        {accountError && (
                            <Alert variant="danger">{accountError}</Alert>
                        )}

                        <p>
                            Create a login for{' '}
                            <strong>
                                {accountTrainer?.name} {accountTrainer?.surname}
                            </strong>.
                        </p>

                        <Form.Group className="mb-3" controlId="trainer-login-email">
                            <Form.Label>Login Email</Form.Label>
                            <Form.Control
                                readOnly
                                type="email"
                                value={accountTrainer?.email || ''}
                                className={inputClass}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="trainer-login-password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                required
                                type="password"
                                autoComplete="new-password"
                                value={password}
                                onChange={event => setPassword(event.target.value)}
                                className={inputClass}
                            />
                            <div className="small text-light mt-2">
                                The backend checks its configured password rules.
                            </div>
                        </Form.Group>

                        <Form.Group controlId="trainer-login-confirm">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                required
                                type="password"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={event =>
                                    setConfirmPassword(event.target.value)
                                }
                                className={inputClass}
                            />
                        </Form.Group>
                    </Modal.Body>

                    <Modal.Footer className="bg-dark border-top-0">
                        <Button
                            variant="secondary"
                            disabled={creatingAccount}
                            onClick={closeAccount}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            type="submit"
                            disabled={creatingAccount}
                        >
                            {creatingAccount
                                ? 'Creating...'
                                : 'Create Account'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}