import React, { useEffect, useState } from 'react';
import { Table, Card, Alert, Spinner } from 'react-bootstrap';

export default function MemberProgramme() {
    const [programmes, setProgrammes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function loadProgrammes() {
            try {
                const response = await fetch('/api/member/programmes', {
                    credentials: 'include'
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Please sign in again.');
                    }

                    if (response.status === 403) {
                        throw new Error(
                            'Please sign in with a Gym Member account.'
                        );
                    }

                    throw new Error(
                        `Could not load programmes (${response.status}).`
                    );
                }

                const data = await response.json();

                if (!cancelled) setProgrammes(data);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadProgrammes();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div>
            <h2 className="mb-4 text-white">
                My Training Programmes
            </h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="bg-dark border-danger text-white">
                <Card.Header className="bg-danger fw-bold">
                    Assigned Training Programmes
                </Card.Header>

                <Card.Body>
                    {loading ? (
                        <Spinner animation="border" variant="danger" />
                    ) : error ? null : programmes.length === 0 ? (
                        <p className="mb-0">
                            No training programmes assigned yet.
                        </p>
                    ) : (
                        <Table striped bordered hover responsive variant="dark">
                            <thead>
                                <tr>
                                    <th>Programme Name</th>
                                    <th>Description</th>
                                    <th>Duration</th>
                                    <th>Fitness Goal</th>
                                </tr>
                            </thead>

                            <tbody>
                                {programmes.map(programme => (
                                    <tr key={programme.programmeId}>
                                        <td>{programme.programmeName}</td>
                                        <td>{programme.description}</td>
                                        <td>{programme.duration}</td>
                                        <td>{programme.fitnessGoal}</td>
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