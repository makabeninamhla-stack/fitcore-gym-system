import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { apiService } from '../services/apiService';

export default function Assignments() {
    const [members, setMembers] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [programmes, setProgrammes] = useState([]);
    const [message, setMessage] = useState(null);

    const [selectedMemberTrainer, setSelectedMemberTrainer] = useState({ memberId: '', trainerId: '' });
    const [selectedMemberProg, setSelectedMemberProg] = useState({ memberId: '', programmeId: '' });

    useEffect(() => {
        const loadData = async () => {
            setMembers(await apiService.getMembers());
            setTrainers(await apiService.getTrainers());
            setProgrammes(await apiService.getProgrammes());
        };
        loadData();
    }, []);

    const handleAssignTrainer = async (e) => {
        e.preventDefault();
        await apiService.assignTrainerToMember(selectedMemberTrainer.memberId, selectedMemberTrainer.trainerId);
        setMessage('Personal Trainer successfully assigned to Gym Member.');
        setTimeout(() => setMessage(null), 3000);
    };

    const handleAssignProgramme = async (e) => {
        e.preventDefault();
        await apiService.assignMemberToProgramme(selectedMemberProg.memberId, selectedMemberProg.programmeId);
        setMessage('Gym Member successfully assigned to Training Programme.');
        setTimeout(() => setMessage(null), 3000);
    };

    return (
        <div>
            <h2 className="mb-4 text-white">System Assignments</h2>
            {message && <Alert variant="success" className="bg-success text-white border-0">{message}</Alert>}

            <Row>
                <Col md={6}>
                    <Card className="mb-4 bg-dark border-secondary text-white">
                        <Card.Header className="bg-danger border-bottom-0 fw-bold">Assign Trainer to Member</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleAssignTrainer}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Select Gym Member</Form.Label>
                                    <Form.Select required onChange={e => setSelectedMemberTrainer({...selectedMemberTrainer, memberId: e.target.value})} className="bg-dark text-white border-secondary">
                                        <option value="">Choose Member...</option>
                                        {members.map(m => <option key={m.id} value={m.id}>{m.memberNumber} - {m.name} {m.surname}</option>)}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Select Personal Trainer</Form.Label>
                                    <Form.Select required onChange={e => setSelectedMemberTrainer({...selectedMemberTrainer, trainerId: e.target.value})} className="bg-dark text-white border-secondary">
                                        <option value="">Choose Trainer...</option>
                                        {trainers.map(t => <option key={t.id} value={t.id}>{t.staffNumber} - {t.name} {t.surname}</option>)}
                                    </Form.Select>
                                </Form.Group>
                                <Button variant="danger" type="submit" className="w-100">Assign Trainer</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="mb-4 bg-dark border-secondary text-white">
                        <Card.Header className="bg-danger border-bottom-0 fw-bold">Assign Member to Programme</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleAssignProgramme}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Select Gym Member</Form.Label>
                                    <Form.Select required onChange={e => setSelectedMemberProg({...selectedMemberProg, memberId: e.target.value})} className="bg-dark text-white border-secondary">
                                        <option value="">Choose Member...</option>
                                        {members.map(m => <option key={m.id} value={m.id}>{m.memberNumber} - {m.name} {m.surname}</option>)}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Select Training Programme</Form.Label>
                                    <Form.Select required onChange={e => setSelectedMemberProg({...selectedMemberProg, programmeId: e.target.value})} className="bg-dark text-white border-secondary">
                                        <option value="">Choose Programme...</option>
                                        {programmes.map(p => <option key={p.id} value={p.id}>{p.programmeId} - {p.programmeName}</option>)}
                                    </Form.Select>
                                </Form.Group>
                                <Button variant="danger" type="submit" className="w-100">Assign Programme</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}