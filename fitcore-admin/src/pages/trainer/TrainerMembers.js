import React, { useEffect, useState } from 'react';
import {
    Table, Card, Form, Spinner, Alert
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';

async function getTrainerData(url) {
    const response = await fetch(url, {
        credentials: 'include'
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Please sign in again.');
        }

        if (response.status === 403) {
            throw new Error(
                'Please sign in with a Personal Trainer account.'
            );
        }

        throw new Error(
            `Could not load trainer information (${response.status}).`
        );
    }

    return response.json();
}

export default function TrainerMembers() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [programmeError, setProgrammeError] = useState('');
    const [q, setQ] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function loadMembers() {
            setLoading(true);
            setError('');
            setProgrammeError('');

            try {
                const data = await getTrainerData(
                    '/api/trainer/members'
                );

                const results = await Promise.all(
                    data.map(async member => {
                        try {
                            const programmes = await getTrainerData(
                                `/api/trainer/members/${member.memberId}/programmes`
                            );

                            return {
                                ...member,
                                programmes,
                                programmesLoaded: true
                            };
                        } catch {
                            return {
                                ...member,
                                programmes: [],
                                programmesLoaded: false
                            };
                        }
                    })
                );

                if (!cancelled) {
                    setMembers(results);

                    if (results.some(m => !m.programmesLoaded)) {
                        setProgrammeError(
                            'Members loaded, but some assigned programmes could not be loaded.'
                        );
                    }
                }
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadMembers();

        return () => {
            cancelled = true;
        };
    }, []);

    const search = q.trim().toLowerCase();

    const list = members.filter(member =>
        [
            member.memberNumber,
            member.name,
            member.surname
        ].some(value =>
            String(value || '').toLowerCase().includes(search)
        )
    );

    return (
        <div>
            <h2 className="mb-4 text-white">My Members</h2>

            {error && (
                <Alert variant="danger">{error}</Alert>
            )}

            {programmeError && (
                <Alert variant="warning">{programmeError}</Alert>
            )}

            <Card className="mb-4 bg-dark border-secondary">
                <Card.Body>
                    <Form.Control
                        placeholder="Search by Member Number, Name, or Surname..."
                        value={q}
                        onChange={event => setQ(event.target.value)}
                        className="bg-dark text-white border-secondary"
                    />
                </Card.Body>
            </Card>

            {loading ? (
                <Spinner animation="border" variant="danger" />
            ) : error ? null : members.length === 0 ? (
                <Alert variant="dark" className="border-secondary">
                    No members assigned to you yet.
                    The administrator must assign members to your
                    trainer profile.
                </Alert>
            ) : (
                <Table variant="dark" striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Member No.</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Membership</th>
                            <th>Programmes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {list.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center">
                                    No members found.
                                </td>
                            </tr>
                        ) : list.map(member => (
                            <tr key={member.memberId}>
                                <td>{member.memberNumber}</td>

                                <td>
                                    {member.name} {member.surname}
                                </td>

                                <td>{member.emailAddress}</td>

                                <td>
                                    {member.membershipType ? (
                                        <StatusBadge
                                            status={member.membershipType}
                                        />
                                    ) : (
                                        <span className="text-white-50">
                                            —
                                        </span>
                                    )}
                                </td>

                                <td>
                                    {!member.programmesLoaded ? (
                                        <span className="text-warning">
                                            Could not load
                                        </span>
                                    ) : member.programmes.length === 0 ? (
                                        <span className="text-white-50">
                                            Not assigned
                                        </span>
                                    ) : (
                                        member.programmes
                                            .map(p => p.programmeName)
                                            .join(', ')
                                    )}
                                </td>

                                <td>
                                    <Link
                                        to="/trainer/plans"
                                        className="btn btn-outline-danger btn-sm"
                                    >
                                        Workout Plans
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
}