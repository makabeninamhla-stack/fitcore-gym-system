// Mock Data
let members = [
    { id: 1, memberNumber: 'M001', name: 'John', surname: 'Doe', gender: 'Male', dob: '1990-05-15', address: '123 Main St', email: 'john@example.com', phone: '0821234567', membershipType: 'Monthly' }
];

let trainers = [
    { id: 1, staffNumber: 'T001', name: 'Jane', surname: 'Smith', gender: 'Female', email: 'jane@fitcore.com', phone: '0712345678', specialization: 'Weight Training' }
];

let programmes = [
    { id: 1, programmeId: 'P001', programmeName: 'Summer Shred', description: 'Intense fat loss', duration: '8 Weeks', fitnessGoal: 'Weight Loss' }
];

let assignments = { memberProgrammes: [], memberTrainers: [] };

// Helper to simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
    // --- Gym Members ---
    getMembers: async () => { await delay(); return [...members]; },
    addMember: async (data) => { await delay(); const newMember = { ...data, id: Date.now() }; members.push(newMember); return newMember; },
    updateMember: async (id, data) => { await delay(); members = members.map(m => m.id === id ? { ...data, id } : m); return data; },
    deleteMember: async (id) => { await delay(); members = members.filter(m => m.id !== id); return true; },

    // --- Personal Trainers ---
    getTrainers: async () => { await delay(); return [...trainers]; },
    addTrainer: async (data) => { await delay(); const newTrainer = { ...data, id: Date.now() }; trainers.push(newTrainer); return newTrainer; },
    updateTrainer: async (id, data) => { await delay(); trainers = trainers.map(t => t.id === id ? { ...data, id } : t); return data; },
    deleteTrainer: async (id) => { await delay(); trainers = trainers.filter(t => t.id !== id); return true; },

    // --- Training Programmes ---
    getProgrammes: async () => {
    const programmes = await memberRequest('/api/TrainingProgrammes');

    return programmes.map(programme => ({
        ...programme,
        id: programme.programmeId
    }));
},

addProgramme: async (data) => {
    const programme = await memberRequest('/api/TrainingProgrammes', {
        method: 'POST',
        body: JSON.stringify({
            programmeName: data.programmeName.trim(),
            description: data.description.trim(),
            duration: data.duration.trim(),
            fitnessGoal: data.fitnessGoal.trim()
        })
    });

    return {
        ...programme,
        id: programme.programmeId
    };
},
    // --- Assignments ---
    assignTrainerToMember: async (memberId, trainerId) => { 
        await delay(); 
        assignments.memberTrainers.push({ memberId, trainerId }); 
        return true; 
    },
    getAssignments: async () => { await delay(0); return { memberProgrammes: [...assignments.memberProgrammes], memberTrainers: [...assignments.memberTrainers] }; },
    assignMemberToProgramme: async (memberId, programmeId) => { 
        await delay(); 
        assignments.memberProgrammes.push({ memberId, programmeId }); 
        return true; 
    }
};
        // Connect member operations to the existing backend.
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

    if (!response.ok) {
        let message = text;

        try {
            const details = JSON.parse(text);
            message = details.errors
                ? Object.values(details.errors).flat().join(' ')
                : details.detail || details.title || text;
        } catch {
            // The backend can return plain text.
        }

        if (response.status === 401) {
            message = 'Please sign in again.';
        } else if (response.status === 403) {
            message = 'Please sign in with an Admin account.';
        }

        throw new Error(
            message || `Request failed (${response.status}).`
        );
    }

    return text ? JSON.parse(text) : null;
}

function memberForScreen(member) {
    return {
        ...member,
        id: member.memberId,
        dob: member.dateOfBirth?.slice(0, 10) || '',
        address: member.homeAddress || '',
        email: member.emailAddress || '',
        phone: member.phoneNumber || ''
    };
}

function memberForBackend(data) {
    return {
        memberNumber: data.memberNumber,
        name: data.name,
        surname: data.surname,
        gender: data.gender,
        dateOfBirth: data.dob,
        homeAddress: data.address,
        emailAddress: data.email,
        phoneNumber: data.phone || null,
        membershipType: data.membershipType,
        trainerId:
            data.trainerId === '' || data.trainerId == null
                ? null
                : Number(data.trainerId)
    };
}

Object.assign(apiService, {
    async getMembers() {
        const members = await memberRequest('/api/GymMembers');
        return members.map(memberForScreen);
    },

    async addMember(data) {
        const created = await memberRequest('/api/GymMembers', {
            method: 'POST',
            body: JSON.stringify(memberForBackend(data))
        });

        const member = await memberRequest(
            `/api/GymMembers/${created.memberId}`
        );

        return memberForScreen(member);
    },

    async updateMember(id, data) {
        await memberRequest(`/api/GymMembers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(memberForBackend(data))
        });

        return { ...data, id };
    },

    async deleteMember(id) {
        await memberRequest(`/api/GymMembers/${id}`, {
            method: 'DELETE'
        });

        return true;
    }
});
       function trainerForScreen(trainer) {
    return {
        ...trainer,
        id: trainer.trainerId,
        email: trainer.emailAddress || '',
        phone: trainer.phoneNumber || ''
    };
}

function trainerForBackend(data) {
    return {
        staffNumber: data.staffNumber.trim(),
        name: data.name.trim(),
        surname: data.surname.trim(),
        gender: data.gender,
        emailAddress: data.email.trim(),
        phoneNumber: data.phone.trim(),
        specialization: data.specialization.trim()
    };
}

Object.assign(apiService, {
    async getTrainers() {
        const trainers = await memberRequest('/api/PersonalTrainers');
        return trainers.map(trainerForScreen);
    },

    async addTrainer(data) {
        const created = await memberRequest('/api/PersonalTrainers', {
            method: 'POST',
            body: JSON.stringify(trainerForBackend(data))
        });

        const trainer = await memberRequest(
            `/api/PersonalTrainers/${created.trainerId}`
        );

        return trainerForScreen(trainer);
    },

    async updateTrainer(id, data) {
        await memberRequest(`/api/PersonalTrainers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(trainerForBackend(data))
        });

        return { ...data, id };
    },

    async deleteTrainer(id) {
        await memberRequest(`/api/PersonalTrainers/${id}`, {
            method: 'DELETE'
        });

        return true;
    }
});