import React, { useEffect, useState } from 'react';
import { Table, Card, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function MemberWorkoutPlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function loadPlans() {
            try {
                const response = await fetch(
                    '/api/member/workout-plans',
                    { credentials: 'include' }
                );

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
                        `Could not load workout plans (${response.status}).`
                    );
                }

                const data = await response.json();

                if (!cancelled) setPlans(data);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadPlans();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div>
            <h2 className="mb-4 text-white">My Workout Plans</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="bg-dark border-danger text-white">
                <Card.Header className="bg-danger fw-bold">
                    Assigned Workout Plans
                </Card.Header>

                <Card.Body>
                    {loading ? (
                        <Spinner animation="border" variant="danger" />
                    ) : error ? null : plans.length === 0 ? (
                        <p className="mb-0">
                            No workout plans assigned yet.
                        </p>
                    ) : (
                        <>
                            <Table
                                striped
                                bordered
                                hover
                                responsive
                                variant="dark"
                            >
                                <thead>
                                    <tr>
                                        <th>Plan ID</th>
                                        <th>Plan Name</th>
                                        <th>Training Programme</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {plans.map(plan => (
                                        <tr key={plan.workoutPlanId}>
                                            <td>{plan.workoutPlanId}</td>
                                            <td>{plan.planName}</td>
                                            <td>{plan.programmeName}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            <Link
                                to="/member/tasks"
                                className="btn btn-outline-danger"
                            >
                                View My Workout Tasks
                            </Link>
                        </>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
}