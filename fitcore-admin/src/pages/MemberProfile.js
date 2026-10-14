import React, { useEffect, useState } from 'react';
import { Table, Card, Alert, Spinner } from 'react-bootstrap';

export default function MemberProfile() {
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function loadProfile() {
            try {
                const response = await fetch('/api/member/profile', {
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

                    if (response.status === 404) {
                        throw new Error(
                            'Member profile unavailable. Check that the profile endpoint exists and your account is linked to a gym member.'
                        );
                    }

                    throw new Error(
                        `Could not load your profile (${response.status}).`
                    );
                }

                const data = await response.json();

                if (!cancelled) setMember(data);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadProfile();

        return () => {
            cancelled = true;
        };
    }, []);

    const rows = member ? [
        ['Member Number', member.memberNumber],
        ['Name', member.name],
        ['Surname', member.surname],
        ['Gender', member.gender],
        ['Date of Birth', member.dateOfBirth?.slice(0, 10)],
        ['Home Address', member.homeAddress],
        ['Email', member.emailAddress],
        ['Phone', member.phoneNumber],
        ['Membership Type', member.membershipType]
    ] : [];

    return (
        <div>
            <h2 className="mb-4 text-white">My Profile</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="bg-dark border-danger text-white">
                <Card.Header className="bg-danger fw-bold">
                    Member Information
                </Card.Header>

                <Card.Body>
                    {loading ? (
                        <Spinner animation="border" variant="danger" />
                    ) : member ? (
                        <Table striped bordered responsive variant="dark">
                            <tbody>
                                {rows.map(([label, value]) => (
                                    <tr key={label}>
                                        <th scope="row">{label}</th>
                                        <td>{value || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : null}
                </Card.Body>
            </Card>
        </div>
    );
}