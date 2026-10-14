import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    return (
        <div>
            <h2 className="mb-4 text-white">System Overview</h2>
            <Row>
                <Col md={4} className="mb-4">
                    <Card className="text-center h-100 border-danger bg-dark text-white">
                        <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                            <Card.Title className="text-danger fs-3 mb-3">Gym Members</Card.Title>
                            <Card.Text className="text-muted mb-4">Manage member profiles, personal details, and active memberships.</Card.Text>
                            <Link to="/members" className="btn btn-outline-danger mt-auto">View Members</Link>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card className="text-center h-100 border-danger bg-dark text-white">
                        <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                            <Card.Title className="text-danger fs-3 mb-3">Personal Trainers</Card.Title>
                            <Card.Text className="text-muted mb-4">Manage staff records, contact info, and training specialties.</Card.Text>
                            <Link to="/trainers" className="btn btn-outline-danger mt-auto">View Trainers</Link>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card className="text-center h-100 border-danger bg-dark text-white">
                        <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                            <Card.Title className="text-danger fs-3 mb-3">Programmes</Card.Title>
                            <Card.Text className="text-muted mb-4">Configure available training programmes and fitness goals.</Card.Text>
                            <Link to="/programmes" className="btn btn-outline-danger mt-auto">View Programmes</Link>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}