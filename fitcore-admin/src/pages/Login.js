import React, { useState } from 'react';
import { Card, Form, Button, Alert, Nav } from 'react-bootstrap';
import { useNavigate, Navigate } from 'react-router-dom';
import bgImage from '../assets/bg.jpg';
import { useAuth, ROLES, homeFor } from '../context/AuthContext';

const empty = { role: '', name: '', surname: '', gender: '', email: '', password: '', confirm: '', adminCode: '' };
const dark = 'bg-dark text-white border-secondary';

export default function Login() {
    const { user, loading, login, signUp } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState('signin');
    const [f, setF] = useState(empty);
    const [validated, setValidated] = useState(false);
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);
    if (loading) {
    return (
        <div className="bg-dark text-white text-center p-5">
            Checking your session...
        </div>
    );
}


    if (user) return <Navigate to={homeFor(user.role)} replace />;
    const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
    const isUp = mode === 'signup';
    const mismatch = isUp && f.confirm !== f.password;

    const submit = async (e) => {
        e.preventDefault();
        setError(null);
        if (e.currentTarget.checkValidity() === false || mismatch) { setValidated(true); return; }
        setBusy(true);
        try {
            const u = isUp ? await signUp(f) : await login(f.role, f.email, f.password);
            navigate(homeFor(u.role), { replace: true });
        } catch (err) { setError(err.message); }
        setBusy(false);
    };

    return (
        <div style={{ backgroundImage: `url(${bgImage})`, backgroundColor: '#0a0a0a', backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <Card className="bg-dark border-danger text-white" style={{ width: '100%', maxWidth: 480 }}>
                <Card.Header className="bg-danger border-bottom-0 text-center">
                    <div className="fw-bold fs-3">FITCORE GYM</div>
                    <Nav variant="pills" justify className="mt-2" activeKey={mode} onSelect={(k) => { setMode(k); setValidated(false); setError(null); }}>
                        <Nav.Item><Nav.Link eventKey="signin" className={mode === 'signin' ? 'bg-dark text-danger' : 'text-white'}>Sign In</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey="signup" className={mode === 'signup' ? 'bg-dark text-danger' : 'text-white'}>First Time? Sign Up</Nav.Link></Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form noValidate validated={validated} onSubmit={submit}>
                        <Form.Group className="mb-3">
                            <Form.Label>I am a...</Form.Label>
                            <Form.Select required value={f.role} onChange={set('role')} className={dark}>
                                <option value="">Select role...</option>
                                {Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">Please select your role.</Form.Control.Feedback>
                        </Form.Group>
                        {isUp && (<>
                            <div className="row mb-3">
                                <Form.Group className="col"><Form.Label>Name</Form.Label><Form.Control required value={f.name} onChange={set('name')} className={dark} /></Form.Group>
                                <Form.Group className="col"><Form.Label>Surname</Form.Label><Form.Control required value={f.surname} onChange={set('surname')} className={dark} /></Form.Group>
                            </div>
                            <Form.Group className="mb-3">
                                <Form.Label>Gender</Form.Label>
                                <Form.Select required value={f.gender} onChange={set('gender')} className={dark}>
                                    <option value="">Select...</option><option>Male</option><option>Female</option><option>Other</option>
                                </Form.Select>
                            </Form.Group>
                        </>)}
                        <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control required type="email" value={f.email} onChange={set('email')} className={dark} />
                            <Form.Control.Feedback type="invalid">Enter a valid email.</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control required type="password" minLength={isUp ? 8 : undefined} value={f.password} onChange={set('password')} className={dark} />
                            <Form.Control.Feedback type="invalid">{isUp ? 'At least 8 characters.' : 'Enter your password.'}</Form.Control.Feedback>
                        </Form.Group>
                        {isUp && (
                            <Form.Group className="mb-3">
                                <Form.Label>Confirm Password</Form.Label>
                                <Form.Control required type="password" isInvalid={validated && mismatch} value={f.confirm} onChange={set('confirm')} className={dark} />
                                <Form.Control.Feedback type="invalid">Passwords do not match.</Form.Control.Feedback>
                            </Form.Group>
                        )}
                        {isUp && f.role === ROLES.ADMIN && (
                            <Form.Group className="mb-3">
                                <Form.Label>Administrator Access Code</Form.Label>
                                <Form.Control required type="password" value={f.adminCode} onChange={set('adminCode')} className={dark} />
                            </Form.Group>
                        )}
                        <Button variant="danger" type="submit" className="w-100" disabled={busy}>{isUp ? 'Create Account' : 'Sign In'}</Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}
