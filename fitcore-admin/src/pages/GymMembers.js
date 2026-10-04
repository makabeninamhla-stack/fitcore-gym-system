import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Spinner, Card } from 'react-bootstrap';
import { apiService } from '../services/apiService';
import StatusBadge from '../components/StatusBadge';

export default function GymMembers() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal & Form State
    const [showModal, setShowModal] = useState(false);
    const [validated, setValidated] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        memberNumber: '', name: '', surname: '', gender: '', dob: '', address: '', email: '', phone: '', membershipType: 'Monthly'
    });

    useEffect(() => { loadMembers(); }, []);

   const loadMembers = async () => {
    setLoading(true);

    try {
        setMembers(await apiService.getMembers());
    } catch (error) {
        window.alert(error.message);
    } finally {
        setLoading(false);
    }
};

    const handleSearch = (e) => setSearchQuery(e.target.value.toLowerCase());

    const filteredMembers = members.filter(m => 
        m.memberNumber.toLowerCase().includes(searchQuery) || 
        m.name.toLowerCase().includes(searchQuery) || 
        m.surname.toLowerCase().includes(searchQuery)
    );

    const handleShow = (member = null) => {
        if (member) {
            setFormData(member);
            setIsEditing(true);
            setCurrentId(member.id);
        } else {
            setFormData({ memberNumber: '', name: '', surname: '', gender: '', dob: '', address: '', email: '', phone: '', membershipType: 'Monthly' });
            setIsEditing(false);
        }
        setValidated(false);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        if (isEditing) await apiService.updateMember(currentId, formData);
        else await apiService.addMember(formData);
        
        setShowModal(false);
        loadMembers();
    };

    const handleDelete = async (id) => {
        if(window.confirm('Delete this Gym Member?')) {
            await apiService.deleteMember(id);
            loadMembers();
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-white">Gym Members</h2>
                <Button variant="danger" onClick={() => handleShow()}>+ Add Member</Button>
            </div>

            <Card className="mb-4 bg-dark border-secondary">
                <Card.Body>
                    <Form.Control 
                        type="text" 
                        placeholder="Search by Member Number, Name, or Surname..." 
                        onChange={handleSearch}
                        className="bg-dark text-white border-secondary"
                    />
                </Card.Body>
            </Card>

            {loading ? <Spinner animation="border" variant="danger" /> : (
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
                        {filteredMembers.length === 0 ? (
                            <tr><td colSpan="6" className="text-center">No members found.</td></tr>
                        ) : (
                            filteredMembers.map(m => (
                                <tr key={m.id}>
                                    <td>{m.memberNumber}</td>
                                    <td>{m.name} {m.surname}</td>
                                    <td>{m.email}</td>
                                    <td>{m.phone}</td>
                                    <td><StatusBadge status={m.membershipType} /></td>
                                    <td>
                                        <Button variant="outline-light" size="sm" className="me-2" onClick={() => handleShow(m)}>Edit</Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(m.id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Header closeButton closeVariant="white" className="bg-danger text-white border-bottom-0">
                        <Modal.Title>{isEditing ? 'Update Gym Member' : 'Add Gym Member'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="bg-dark text-white border-0">
                        <Row className="mb-3">
                            <Form.Group as={Col}>
                                <Form.Label>Member Number</Form.Label>
                                <Form.Control required type="text" value={formData.memberNumber} onChange={e => setFormData({...formData, memberNumber: e.target.value})} className="bg-dark text-white border-secondary" />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label>Membership Type</Form.Label>
                                <Form.Select value={formData.membershipType} onChange={e => setFormData({...formData, membershipType: e.target.value})} className="bg-dark text-white border-secondary">
                                    <option>Monthly</option>
                                    <option>Quarterly</option>
                                    <option>Annual</option>
                                </Form.Select>
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col}>
                                <Form.Label>Name</Form.Label>
                                <Form.Control required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-dark text-white border-secondary" />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label>Surname</Form.Label>
                                <Form.Control required type="text" value={formData.surname} onChange={e => setFormData({...formData, surname: e.target.value})} className="bg-dark text-white border-secondary" />
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col}>
                                <Form.Label>Gender</Form.Label>
                                <Form.Select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="bg-dark text-white border-secondary">
                                    <option value="">Select...</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label>Date of Birth</Form.Label>
                                <Form.Control required type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="bg-dark text-white border-secondary" />
                            </Form.Group>
                        </Row>
                        <Row className="mb-3">
                            <Form.Group as={Col}>
                                <Form.Label>Email</Form.Label>
                                <Form.Control required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-dark text-white border-secondary" />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label>Phone Number</Form.Label>
                                <Form.Control type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-dark text-white border-secondary" />
                            </Form.Group>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Home Address</Form.Label>
                            <Form.Control as="textarea" rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="bg-dark text-white border-secondary" />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="bg-dark border-top-0">
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="danger" type="submit">Save Member</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}