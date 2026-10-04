import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function ConfirmModal({ show, onHide, onConfirm, title, message }) {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="bg-danger text-white border-bottom-0">
                <Modal.Title>{title || 'Confirm Action'}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-dark text-white border-0">
                <p>{message || 'Are you sure you want to proceed?'}</p>
            </Modal.Body>
            <Modal.Footer className="bg-dark border-top-0">
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button variant="danger" onClick={onConfirm}>Confirm</Button>
            </Modal.Footer>
        </Modal>
    );
}