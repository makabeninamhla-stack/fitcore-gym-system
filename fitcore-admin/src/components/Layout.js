import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import bgImage from '../assets/bg.jpg';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
    const location = useLocation();
    const isMember = location.pathname.startsWith('/member');
    const isTrainer = location.pathname.startsWith('/trainer');
    const navigate = useNavigate();
    const { logout } = useAuth();

   return (
        <>
            {/* 1. Navigation Bar */}
            <Navbar bg="dark" variant="dark" expand="lg" className="border-bottom border-danger border-3">
                <Container>
                    <Navbar.Brand
                    as={Link}
                    to={isMember ? '/member' : isTrainer ? '/trainer' : '/'}
                    className="text-danger fw-bold fs-4"
                >
                    FITCORE {isMember ? 'GYM' : isTrainer ? 'TRAINER' : 'ADMIN'}
                </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                       <Nav className="me-auto">

                            {isTrainer ? (
                                <>
                                    <Nav.Link as={Link} to="/trainer" active={location.pathname === '/trainer'}>Dashboard</Nav.Link>
                                    <Nav.Link as={Link} to="/trainer/members" active={location.pathname === '/trainer/members'}>My Members</Nav.Link>
                                    <Nav.Link as={Link} to="/trainer/programmes" active={location.pathname === '/trainer/programmes'}>Programmes</Nav.Link>
                                    <Nav.Link as={Link} to="/trainer/plans" active={location.pathname === '/trainer/plans'}>Workout Plans</Nav.Link>
                                </>
                            ) : isMember ? (
                                <>
                                    <Nav.Link
                                        as={Link}
                                        to="/member"
                                        active={location.pathname === '/member'}
                                    >
                                        Dashboard
                                    </Nav.Link>

                                    <Nav.Link
                                        as={Link}
                                        to="/member/profile"
                                        active={location.pathname === '/member/profile'}
                                    >
                                        My Profile
                                    </Nav.Link>

                                    <Nav.Link
                                        as={Link}
                                        to="/member/programme"
                                        active={location.pathname === '/member/programme'}
                                    >
                                        Training Programme
                                    </Nav.Link>

                                    <Nav.Link
                                        as={Link}
                                        to="/member/workouts"
                                        active={location.pathname === '/member/workouts'}
                                    >
                                        Workout Plans
                                    </Nav.Link>

                                    <Nav.Link
                                        as={Link}
                                        to="/member/tasks"
                                        active={location.pathname === '/member/tasks'}
                                    >
                                        Workout Tasks
                                    </Nav.Link>
                                </>
                            ) : (
                                <>
                                    <Nav.Link
                                        as={Link}
                                        to="/"
                                        active={location.pathname === '/'}
                                    >
                                        Dashboard
                                    </Nav.Link>

                                    <Nav.Link
                                        as={Link}
                                        to="/members"
                                        active={location.pathname === '/members'}
                                    >
                                        Gym Members
                                    </Nav.Link>

                                    <Nav.Link
                                        as={Link}
                                        to="/trainers"
                                        active={location.pathname === '/trainers'}
                                    >
                                        Personal Trainers
                                    </Nav.Link>

                                    <Nav.Link
                                        as={Link}
                                        to="/programmes"
                                        active={location.pathname === '/programmes'}
                                    >
                                        Programmes
                                    </Nav.Link>

                                    <Nav.Link
                                        as={Link}
                                        to="/assignments"
                                        active={location.pathname === '/assignments'}
                                    >
                                        Assignments
                                    </Nav.Link>
                                </>
                            )}

                        </Nav>
                        <Nav>
                            <Navbar.Text className="text-white">
                                Role:{' '}
                                <span className="text-danger fw-bold">
                                    {isMember ? 'Gym Member' : isTrainer ? 'Personal Trainer' : 'Administrator'}
                                </span>
                            </Navbar.Text>
                            <Button variant="outline-danger" size="sm" className="ms-3" onClick={() => { logout(); navigate('/login'); }}>Logout</Button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* 2. Main Content Wrapper */}
            <div style={{
    backgroundImage: `url(${bgImage})`,
    backgroundColor: '#0a0a0a',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    padding: '20px'
}}>
                
                {/* This renders the content of whichever page is currently active */}
                {children} 
            </div>
        </>
    );
}