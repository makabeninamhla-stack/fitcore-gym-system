import React, { useState, useEffect } from 'react';
import {
    Table, Button, Modal, Form, Row, Col, Spinner, Card, Alert
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

export default function Trainers() {
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [validated, setValidated] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({ ...blank });
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    const inputClass = 'bg-dark text-white border-secondary';

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const data = await apiService.getTrainers();
                if (!cancelled) setTrainers(data);
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

    async function loadTrainers() {
        setLoading(true);
        setError('');

        try {
            setTrainers(await apiService.getTrainers());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function handleShow(trainer = null) {
        setCurrentId(trainer ? trainer.id : null);
        setFormData(trainer ? { ...trainer } : { ...blank });
        setValidated(false);
        setFormError('');
        setShowModal(true);
    }

    function changeField(field, value) {
        setFormData(previous => ({
            ...previous,
            [field]: value
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!event.currentTarget.checkValidity()) {
            setValidated(true);
            return;
        }

        setSaving(true);
        setFormError('');

        try {
            if (currentId !== null) {
                await apiService.updateTrainer(currentId, formData);
            } else {
                await apiService.addTrainer(formData);
            }

            setShowModal(false);
            await loadTrainers();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('Delete this Personal Trainer?')) return;

        setSaving(true);
        setError('');

        try {
            await apiService.deleteTrainer(id);
            await loadTrainers();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    const search = searchQuery.trim().toLowerCase();

    const filteredTrainers = trainers.filter(trainer =>
        [trainer.staffNumber, trainer.name, trainer.surname]
            .some(value =>
                String(value || '').toLowerCase().includes(search)
            )
    );

    return (
        <div>
            <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-4">
                <h2 className="text-white mb-0">Personal Trainers</h2>
                <Button
                    variant="danger"
                    onClick={() => handleShow()}
                    disabled={saving}
                >
                    + Add Trainer
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="mb-4 bg-dark border-secondary">
                <Card.Body>
                    <Form.Control
                        type="text"
                        placeholder="Search by Staff Number, Name, or Surname..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
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
                        ) : filteredTrainers.map(trainer => (
                            <tr key={trainer.id}>
                                <td>{trainer.staffNumber}</td>
                                <td>{trainer.name} {trainer.surname}</td>
                                <td>{trainer.email}</td>
                                <td>{trainer.phone}</td>
                                <td>{trainer.specialization}</td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="outline-light"
                                            size="sm"
                                            onClick={() => handleShow(trainer)}
                                            disabled={saving}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(trainer.id)}
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
            )}

            <Modal
                show={showModal}
                onHide={() => {
                    if (!saving) setShowModal(false);
                }}
                size="lg"
            >
                <Form
                    noValidate
                    validated={validated}
                    onSubmit={handleSubmit}
                >
                    <Modal.Header
                        closeButton={!saving}
                        closeVariant="white"
                        className="bg-danger text-white border-bottom-0"
                    >
                        <Modal.Title>
                            {currentId !== null ? 'Update Trainer' : 'Add Trainer'}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body className="bg-dark text-white">
                        {formError && (
                            <Alert variant="danger">{formError}</Alert>
                        )}

                        <fieldset disabled={saving}>
                            <Form.Group className="mb-3">
                                <Form.Label>Gender</Form.Label>
                                <Form.Select
                                    required
                                    value={formData.gender}
                                    onChange={e => changeField('gender', e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">Select gender...</option>
                                    <option>Female</option>
                                    <option>Male</option>
                                    <option>Prefer not to say</option>
                                    <option>Other</option>
                                </Form.Select>
                            </Form.Group>

                            <Row>
                                <Form.Group as={Col} md={6} className="mb-3">
                                    <Form.Label>Staff Number</Form.Label>
                                    <Form.Control
                                        required
                                        value={formData.staffNumber}
                                        onChange={e => changeField('staffNumber', e.target.value)}
                                        className={inputClass}
                                    />
                                </Form.Group>

                                <Form.Group as={Col} md={6} className="mb-3">
                                    <Form.Label>Specialization</Form.Label>
                                    <Form.Control
                                        required
                                        value={formData.specialization}
                                        onChange={e => changeField('specialization', e.target.value)}
                                        className={inputClass}
                                    />
                                </Form.Group>
                            </Row>

                            <Row>
                                <Form.Group as={Col} md={6} className="mb-3">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        required
                                        value={formData.name}
                                        onChange={e => changeField('name', e.target.value)}
                                        className={inputClass}
                                    />
                                </Form.Group>

                                <Form.Group as={Col} md={6} className="mb-3">
                                    <Form.Label>Surname</Form.Label>
                                    <Form.Control
                                        required
                                        value={formData.surname}
                                        onChange={e => changeField('surname', e.target.value)}
                                        className={inputClass}
                                    />
                                </Form.Group>
                            </Row>

                            <Row>
                                <Form.Group as={Col} md={6} className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={e => changeField('email', e.target.value)}
                                        className={inputClass}
                                    />
                                </Form.Group>

                                <Form.Group as={Col} md={6} className="mb-3">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control
                                        required
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => changeField('phone', e.target.value)}
                                        className={inputClass}
                                    />
                                </Form.Group>
                            </Row>
                        </fieldset>
                    </Modal.Body>

                    <Modal.Footer className="bg-dark border-top-0">
                        <Button
                            variant="secondary"
                            onClick={() => setShowModal(false)}
                            disabled={saving}
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
        </div>
    );
}