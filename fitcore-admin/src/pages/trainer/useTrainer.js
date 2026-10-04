import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { trainerService } from '../../services/trainerService';

export default function useTrainer() {
    const { user } = useAuth();
    const [trainer, setTrainer] = useState(null);
    useEffect(() => { trainerService.getCurrentTrainer(user).then(setTrainer); }, [user]);
    return trainer;
}
