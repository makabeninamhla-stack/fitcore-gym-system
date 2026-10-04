import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Member() {
    return (
        <div>

            <h2 className="mb-4 text-white">
                Member Dashboard
            </h2>

            <Row>

                {/* My Profile */}
                <Col md={6} className="mb-4">
                    <Card className="h-100 bg-dark border-danger text-white">

                        <Card.Header className="bg-danger fw-bold">
                            My Profile
                        </Card.Header>

                        <Card.Body>
                            <Card.Title>
                                Member Information
                            </Card.Title>

                            <Card.Text className="text-muted">
                                View your member information.
                            </Card.Text>

                            <Link
                                to="/member/profile"
                                className="btn btn-outline-danger"
                            >
                                View Profile
                            </Link>

                        </Card.Body>

                    </Card>
                </Col>

                {/* Training Programme */}
                <Col md={6} className="mb-4">
                    <Card className="h-100 bg-dark border-danger text-white">

                        <Card.Header className="bg-danger fw-bold">
                            My Training Programme
                        </Card.Header>

                        <Card.Body>
                            <Card.Title>
                                Training Programme
                            </Card.Title>

                            <Card.Text className="text-muted">
                                View your assigned training programme.
                            </Card.Text>

                            <Link
                                to="/member/programme"
                                className="btn btn-outline-danger"
                            >
                                View Programme
                            </Link>

                        </Card.Body>

                    </Card>
                </Col>

                {/* Workout Plans */}
                <Col md={6} className="mb-4">
                    <Card className="h-100 bg-dark border-danger text-white">

                        <Card.Header className="bg-danger fw-bold">
                            My Workout Plans
                        </Card.Header>

                        <Card.Body>
                            <Card.Title>
                                Workout Plans
                            </Card.Title>

                            <Card.Text className="text-muted">
                                View your assigned workout plans.
                            </Card.Text>

                                                        <Link
                                to="/member/workouts"
                                className="btn btn-outline-danger"
                            >
                                View Workout Plans
                            </Link>

                        </Card.Body>

                    </Card>
                </Col>

                {/* Workout Tasks */}
                <Col md={6} className="mb-4">
                    <Card className="h-100 bg-dark border-danger text-white">

                        <Card.Header className="bg-danger fw-bold">
                            My Workout Tasks
                        </Card.Header>

                        <Card.Body>
                            <Card.Title>
                                Workout Tasks
                            </Card.Title>

                            <Card.Text className="text-muted">
                                View and update your workout tasks.
                            </Card.Text>

                            <Link
                                to="/member/tasks"
                                className="btn btn-outline-danger"
                            >
                                View Tasks
                            </Link>

                        </Card.Body>

                    </Card>
                </Col>

            </Row>

        </div>
    );
}
