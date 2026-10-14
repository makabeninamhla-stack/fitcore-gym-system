import React, { useEffect, useState } from 'react';
import {
    Alert, Button, Card, Col, Form,
    Modal, Row, Spinner, Table
} from 'react-bootstrap';
import { apiService } from '../services/apiService';
import StatusBadge from '../components/StatusBadge';

const blankMember = {
    memberNumber: '',
    name: '',
    surname: '',
    gender: '',
    dob: '',
    address: '',
    email: '',
    phone: '',
    membershipType: 'Monthly',
    trainerId: null
};

const inputClass = 'bg-dark text-white border-secondary';

async function memberRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    const text = await response.text();
    let result = text;

    try {
        result = text ? JSON.parse(text) : null;
    } catch {
        // Some backend errors are plain text.
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
            message = 'Please sign in with an Administrator account.';
        }

        throw new Error(
            message || `Request failed (${response.status}).`
        );
    }

    return result;
}

async function searchMembers(search, signal) {
    const query = new URLSearchParams({
        search: search.trim()
    });

    const members = await memberRequest(
        `/api/GymMembers?${query}`,
        { signal }
    );

    return members.map(member => ({
        ...member,
        id: member.memberId,
        dob: member.dateOfBirth?.slice(0, 10) || '',
        address: member.homeAddress || '',
        email: member.emailAddress || '',
        phone: member.phoneNumber || ''
    }));
}

export default function GymMembers() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [reload, setReload] = useState(0);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [validated, setValidated] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({ ...blankMember });
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [accountMember, setAccountMember] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [accountError, setAccountError] = useState('');
    const [creatingAccount, setCreatingAccount] = useState(false);
    const [createdAccountIds, setCreatedAccountIds] = useState([]);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError('');

        const timer = setTimeout(async () => {
            try {
                const data = await searchMembers(
                    searchQuery,
                    controller.signal
                );

                if (!controller.signal.aborted) setMembers(data);
            } catch (err) {
                if (!controller.signal.aborted) {
                    setMembers([]);
                    setError(err.message);
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, 300);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [searchQuery, reload]);

    function refreshMembers() {
        setReload(previous => previous + 1);
    }

    function openMember(member = null) {
        setCurrentId(member ? member.id : null);
        setFormData(
            member ? { ...blankMember, ...member } : { ...blankMember }
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

    async function saveMember(event) {
        event.preventDefault();
        setValidated(true);
        setFormError('');

        if (!event.currentTarget.checkValidity()) return;

        setSaving(true);

        try {
            if (currentId !== null) {
                await apiService.updateMember(currentId, formData);
            } else {
                await apiService.addMember(formData);
            }

            setShowModal(false);
            setMessage('Member saved successfully.');
            refreshMembers();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function deleteMember(id) {
        if (!window.confirm('Delete this gym member?')) return;

        setError('');
        setMessage('');
        setDeletingId(id);

        try {
            await apiService.deleteMember(id);
            setMessage('Member deleted successfully.');
            refreshMembers();
        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingId(null);
        }
    }

    function openAccount(member) {
        setAccountMember(member);
        setPassword('');
        setConfirmPassword('');
        setAccountError('');
    }

    function closeAccount() {
        if (creatingAccount) return;

        setAccountMember(null);
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
            await memberRequest(
                `/api/ProfileAccounts/members/${accountMember.id}`,
                {
                    method: 'POST',
                    body: JSON.stringify({ password })
                }
            );

            setCreatedAccountIds(previous => [
                ...previous,
                accountMember.id
            ]);

            setMessage(
                `Login account created for ${accountMember.email}. ` +
                'They can now sign in as a Gym Member.'
            );
            setError('');
            setAccountMember(null);
            setPassword('');
            setConfirmPassword('');
            refreshMembers();
        } catch (err) {
            setAccountError(err.message);
        } finally {
            setCreatingAccount(false);
        }
    }

    return (
        <div>
            <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-4">
                <h2 className="text-white mb-0">Gym Members</h2>
                <Button variant="danger" onClick={() => openMember()}>
                    + Add Member
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
                        placeholder="Search by Member Number, Name, or Surname..."
                        aria-label="Search members"
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
                            <th>Member No.</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Membership</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center">
                                    No members found.
                                </td>
                            </tr>
                        ) : members.map(member => {
                            const hasAccount = Boolean(member.userId) ||
                                createdAccountIds.includes(member.id);

                            return (
                                <tr key={member.id}>
                                    <td>{member.memberNumber}</td>
                                    <td>{member.name} {member.surname}</td>
                                    <td>{member.email}</td>
                                    <td>{member.phone || '—'}</td>
                                    <td>
                                        <StatusBadge
                                            status={member.membershipType}
                                        />
                                    </td>
                                    <td>
                                        <div className="d-flex flex-wrap gap-2">
                                            <Button
                                                variant="outline-light"
                                                size="sm"
                                                onClick={() => openMember(member)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                disabled={deletingId !== null}
                                                onClick={() => deleteMember(member.id)}
                                            >
                                                {deletingId === member.id
                                                    ? 'Deleting...'
                                                    : 'Delete'}
                                            </Button>
                                            <Button
                                                variant="outline-info"
                                                size="sm"
                                                disabled={hasAccount}
                                                onClick={() => openAccount(member)}
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
                    onSubmit={saveMember}
                >
                    <Modal.Header
                        closeButton={!saving}
                        closeVariant="white"
                        className="bg-danger text-white border-bottom-0"
                    >
                        <Modal.Title>
                            {currentId !== null
                                ? 'Update Gym Member'
                                : 'Add Gym Member'}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body className="bg-dark text-white">
                        {formError && (
                            <Alert variant="danger">{formError}</Alert>
                        )}

                        <fieldset disabled={saving}>
                            <Row>
                                {[
                                    ['memberNumber', 'Member Number', 'text'],
                                    ['name', 'Name', 'text'],
                                    ['surname', 'Surname', 'text'],
                                    ['dob', 'Date of Birth', 'date'],
                                    ['email', 'Email', 'email'],
                                    ['phone', 'Phone Number (optional)', 'tel']
                                ].map(([field, label, type]) => (
                                    <Form.Group
                                        as={Col}
                                        md={6}
                                        className="mb-3"
                                        controlId={`member-${field}`}
                                        key={field}
                                    >
                                        <Form.Label>{label}</Form.Label>
                                        <Form.Control
                                            required={field !== 'phone'}
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

                                <Form.Group
                                    as={Col}
                                    md={6}
                                    className="mb-3"
                                    controlId="member-gender"
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

                                <Form.Group
                                    as={Col}
                                    md={6}
                                    className="mb-3"
                                    controlId="member-membership"
                                >
                                    <Form.Label>Membership Type</Form.Label>
                                    <Form.Select
                                        required
                                        value={formData.membershipType}
                                        onChange={changeField('membershipType')}
                                        className={inputClass}
                                    >
                                        <option>Monthly</option>
                                        <option>Quarterly</option>
                                        <option>Annual</option>
                                    </Form.Select>
                                </Form.Group>
                            </Row>

                            <Form.Group
                                className="mb-3"
                                controlId="member-address"
                            >
                                <Form.Label>Home Address</Form.Label>
                                <Form.Control
                                    required
                                    as="textarea"
                                    rows={2}
                                    value={formData.address}
                                    onChange={changeField('address')}
                                    className={inputClass}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Enter a home address.
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
                            {saving ? 'Saving...' : 'Save Member'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <Modal
                show={accountMember !== null}
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
                        <Modal.Title>Create Member Login Account</Modal.Title>
                    </Modal.Header>

                    <Modal.Body className="bg-dark text-white">
                        {accountError && (
                            <Alert variant="danger">{accountError}</Alert>
                        )}

                        <p>
                            Create a login for{' '}
                            <strong>
                                {accountMember?.name} {accountMember?.surname}
                            </strong>.
                        </p>

                        <fieldset disabled={creatingAccount}>
                            <Form.Group
                                className="mb-3"
                                controlId="account-email"
                            >
                                <Form.Label>Login Email</Form.Label>
                                <Form.Control
                                    readOnly
                                    type="email"
                                    value={accountMember?.email || ''}
                                    className={inputClass}
                                />
                            </Form.Group>

                            <Form.Group
                                className="mb-3"
                                controlId="account-password"
                            >
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    required
                                    type="password"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={event =>
                                        setPassword(event.target.value)
                                    }
                                    className={inputClass}
                                />
                            </Form.Group>

                            <Form.Group controlId="account-confirm">
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
                        </fieldset>
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