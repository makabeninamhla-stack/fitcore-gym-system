import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Spinner } from 'react-bootstrap';
import { apiService } from '../services/apiService';
import StatusBadge from '../components/StatusBadge';

export default function Programmes() {
    const [programmes, setProgrammes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState({ programmeName: '', description: '', duration: '', fitnessGoal: 'Weight Loss' });

    useEffect(() => { loadProgrammes(); }, []);

    const loadProgrammes = async () => {
        setLoading(true);
        setProgrammes(await apiService.getProgrammes());
        setLoading(false);
    };

    const handleShow = () => {
        setFormData({ programmeName: '', description: '', duration: '', fitnessGoal: 'Weight Loss' });
        setValidated(false);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }
        await apiService.addProgramme(formData);
        setShowModal(false);
        loadProgrammes();
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Training Programmes</h2>
                <Button variant="danger" onClick={handleShow}>+ Add Programme</Button>
            </div>
            
            {loading ? <Spinner animation="border" variant="danger" /> : (
                <Table variant="dark" striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Programme ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Duration</th>
                            <th>Fitness Goal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {programmes.length === 0 ? <tr><td colSpan="5" className="text-center">No programmes found.</td></tr> :
                            programmes.map(p => (
                                <tr key={p.id}>
                                    <td>{p.programmeId}</td>
                                    <td>{p.programmeName}</td>
                                    <td>{p.description}</td>
                                    <td>{p.duration}</td>
                                    <td><StatusBadge status={p.fitnessGoal} /></td>
                                </tr>
                            ))
                        }
                    </tbody>
                </Table>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Header closeButton className="bg-danger text-white border-bottom-0"><Modal.Title>Add Training Programme</Modal.Title></Modal.Header>
                    <Modal.Body className="bg-dark text-white border-0">
                        <Row className="mb-3">
                            <Form.Group as={Col}>
                                <Form.Label>Programme Name</Form.Label>
                                <Form.Control required type="text" value={formData.programmeName} onChange={e => setFormData({...formData, programmeName: e.target.value})} className="bg-dark text-white border-secondary" />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label>Fitness Goal</Form.Label>
                                <Form.Select value={formData.fitnessGoal} onChange={e => setFormData({...formData, fitnessGoal: e.target.value})} className="bg-dark text-white border-secondary">
                                    <option>Weight Loss</option>
                                    <option>Muscle Gain</option>
                                    <option>Endurance</option>
                                    <option>Flexibility</option>
                                </Form.Select>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col}>
                                <Form.Label>Duration (e.g. 8 Weeks)</Form.Label>
                                <Form.Control required type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="bg-dark text-white border-secondary" />
                            </Form.Group>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={3} required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-dark text-white border-secondary" />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="bg-dark border-top-0">
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="danger" type="submit">Save Programme</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}