async function request(url, options = {}) {
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
            // Plain-text error response.
        }

        if (response.status === 401) {
            message = 'Please sign in again.';
        } else if (response.status === 403) {
            message = 'Your account cannot access this trainer resource.';
        }

        throw new Error(
            message || `Request failed (${response.status}).`
        );
    }

    return text ? JSON.parse(text) : null;
}

function mapPlan(plan) {
    return {
        ...plan,
        id: plan.workoutPlanId,
        planCode: `WP${plan.workoutPlanId}`
    };
}

function mapTask(task) {
    return {
        ...task,
        id: task.workoutTaskId,
        taskCode: `EX${task.workoutTaskId}`,
        planId: task.workoutPlanId,
        sets: task.numberOfSets,
        reps: task.numberOfRepetitions,
        dueDate: task.workoutDate?.slice(0, 16) || ''
    };
}

export const trainerService = {
    async getCurrentTrainer() {
        const trainer = await request('/api/trainer/profile');

        return {
            ...trainer,
            id: trainer.trainerId,
            email: trainer.emailAddress || '',
            phone: trainer.phoneNumber || ''
        };
    },

    async getMemberProgrammes(memberId) {
        const programmes = await request(
            `/api/trainer/members/${memberId}/programmes`
        );

        return programmes.map(programme => ({
            ...programme,
            id: programme.programmeId
        }));
    },

    async getAssignedMembers() {
        const members = await request('/api/trainer/members');

        return Promise.all(
            members.map(async member => {
                const programmes =
                    await trainerService.getMemberProgrammes(
                        member.memberId
                    );

                return {
                    ...member,
                    id: member.memberId,
                    email: member.emailAddress || '',
                    programmes,
                    programme: programmes[0] || null
                };
            })
        );
    },

    async getProgrammes() {
        const members = await trainerService.getAssignedMembers();
        const unique = new Map();

        members.forEach(member => {
            member.programmes.forEach(programme => {
                unique.set(programme.programmeId, programme);
            });
        });

        return [...unique.values()];
    },

    async getPlans() {
        const plans = await request('/api/trainer/workout-plans');
        return plans.map(mapPlan);
    },

    async getPlan(id) {
        const plans = await trainerService.getPlans();
        return plans.find(plan => plan.id === Number(id)) || null;
    },

    async savePlan(data, id = null) {
        if (!data.programmeId) {
            throw new Error('Select an assigned programme first.');
        }

        const editing = id !== null && id !== undefined;

        const result = await request(
            editing
                ? `/api/trainer/workout-plans/${id}`
                : '/api/trainer/workout-plans',
            {
                method: editing ? 'PUT' : 'POST',
                body: JSON.stringify({
                    planName: data.planName.trim(),
                    memberId: Number(data.memberId),
                    programmeId: Number(data.programmeId)
                })
            }
        );

        return trainerService.getPlan(
            editing ? id : result.workoutPlanId
        );
    },

    async deletePlan(id) {
        await request(
            `/api/trainer/workout-plans/${id}`,
            { method: 'DELETE' }
        );

        return true;
    },

    async getTasks(planId) {
        const tasks = await request(
            `/api/trainer/workout-plans/${planId}/tasks`
        );

        return tasks.map(mapTask);
    },

    async countTasks(planId) {
        const tasks = await trainerService.getTasks(planId);
        return tasks.length;
    },

    async saveTask(data, id = null) {
        const baseUrl =
            `/api/trainer/workout-plans/${data.planId}/tasks`;

        const editing = id !== null && id !== undefined;

        return request(
            editing ? `${baseUrl}/${id}` : baseUrl,
            {
                method: editing ? 'PUT' : 'POST',
                body: JSON.stringify({
                    exerciseName: data.exerciseName,
                    description: data.description,
                    numberOfSets: Number(data.sets),
                    numberOfRepetitions: Number(data.reps),
                    workoutDate: data.dueDate
                })
            }
        );
    },

    async deleteTask(id, planId) {
        if (!planId) {
            throw new Error('The workout plan ID is required.');
        }

        await request(
            `/api/trainer/workout-plans/${planId}/tasks/${id}`,
            { method: 'DELETE' }
        );

        return true;
    }
};