import React, { useEffect, useState } from 'react';
import { Table, Card, Spinner, Alert } from 'react-bootstrap';
import { trainerService } from '../../services/trainerService';
import StatusBadge from '../../components/StatusBadge';
import useTrainer from './useTrainer';

export default function TrainerProgrammes() {
    const trainer = useTrainer();
    const [rows, setRows] = useState(null);
    useEffect(() => {
        if (!trainer) return;
        trainerService.getAssignedMembers(trainer.id).then(ms => {
            const map = new Map();
            ms.filter(m => m.programme).forEach(m => {
                const e = map.get(m.programme.id) || { ...m.programme, members: [] };
                e.members.push(`${m.name} ${m.surname}`);
                map.set(m.programme.id, e);
            });
            setRows([...map.values()]);
        });
    }, [trainer]);

    return (
        <div>
            <h2 className="mb-4 text-white">Training Programmes of My Members</h2>
            <Card className="bg-dark border-danger text-white">
                <Card.Header className="bg-danger fw-bold">Assigned Programmes</Card.Header>
                <Card.Body>
                    {!rows ? <Spinner animation="border" variant="danger" /> : rows.length === 0 ? (
                        <Alert variant="dark" className="border-secondary mb-0">None of your members have a programme yet.</Alert>
                    ) : (
                        <Table variant="dark" striped bordered hover responsive>
                            <thead><tr><th>Programme</th><th>Description</th><th>Duration</th><th>Fitness Goal</th><th>My Members</th></tr></thead>
                            <tbody>{rows.map(p => (
                                <tr key={p.id}><td>{p.programmeName}</td><td>{p.description}</td><td>{p.duration}</td>
                                    <td><StatusBadge status={p.fitnessGoal} /></td><td>{p.members.join(', ')}</td></tr>
                            ))}</tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
}
