import React from 'react';
import { Badge } from 'react-bootstrap';

export default function StatusBadge({ status }) {
    let variant = 'secondary';
    
    // Assign colors based on keywords
    switch (status?.toLowerCase()) {
        case 'weight loss':
        case 'active':
            variant = 'success';
            break;
        case 'weight training':
        case 'muscle gain':
            variant = 'warning';
            break;
        case 'monthly':
        case 'cardio':
        case 'crossfit':
            variant = 'info';
            break;
        default:
            variant = 'secondary';
    }

    return <Badge bg={variant} text={variant === 'warning' ? 'dark' : 'light'}>{status}</Badge>;
}