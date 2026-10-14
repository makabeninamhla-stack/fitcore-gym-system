import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const cards = [
    ['My Members', 'View the gym members assigned to you.', '/trainer/members', 'View Members'],
    ['Training Programmes', 'See the programmes assigned to your members.', '/trainer/programmes', 'View Programmes'],
    ['Workout Plans', 'Create and manage workout plans and exercise tasks.', '/trainer/plans', 'Manage Plans']
];

export default function TrainerDashboard() {
    const { user } = useAuth();
    return (
        <div>
            <h2 className="mb-4 text-white">Trainer Dashboard <small className="text-muted fs-5">Welcome, {user.name || user.email}</small></h2>
            <Row>
                {cards.map(([title, text, to, btn]) => (
                    <Col md={4} className="mb-4" key={to}>
                        <Card className="text-center h-100 border-danger bg-dark text-white">
                            <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                                <Card.Title className="text-danger fs-3 mb-3">{title}</Card.Title>
                                <Card.Text className="text-muted mb-4">{text}</Card.Text>
                                <Link to={to} className="btn btn-outline-danger mt-auto">{btn}</Link>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}
