import React, {
    createContext,
    useContext,
    useEffect,
    useState
} from 'react';

export const ROLES = {
    ADMIN: 'Administrator',
    TRAINER: 'Personal Trainer',
    MEMBER: 'Gym Member'
};

// Kept for compatibility with the existing login page.
// Account creation must be handled by the backend.
export const ADMIN_CODE = 'FITCORE-ADMIN';

export const homeFor = (role) =>
    role === ROLES.ADMIN
        ? '/'
        : role === ROLES.TRAINER
            ? '/trainer'
            : '/member';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

function convertAccount(account, selectedRole) {
    const roles = account.roles ?? [];

    const availableRoles = [
        roles.includes('Admin') ? ROLES.ADMIN : null,
        roles.includes('PersonalTrainer') ? ROLES.TRAINER : null,
        roles.includes('GymMember') ? ROLES.MEMBER : null
    ].filter(Boolean);

    if (availableRoles.length === 0) {
        throw new Error('Your account has no supported role.');
    }

    if (selectedRole && !availableRoles.includes(selectedRole)) {
        throw new Error('This account does not have the selected role.');
    }

    return {
        id: account.id,
        email: account.email,
        roles,
        role: selectedRole || availableRoles[0],
        name: account.name || '',
        surname: account.surname || ''
    };
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function checkSession() {
            try {
                const response = await fetch('/api/Auth/me', {
                    credentials: 'include'
                });

                if (!response.ok) return;

                const account = await response.json();

                if (!cancelled) {
                    setUser(convertAccount(account));
                }
            } catch {
                if (!cancelled) setUser(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        checkSession();

        return () => {
            cancelled = true;
        };
    }, []);

    async function login(role, email, password) {
        const response = await fetch('/api/Auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                email: email.trim(),
                password
            })
        });

        if (!response.ok) {
            throw new Error(
                response.status === 401
                    ? 'Incorrect email or password.'
                    : `Login failed (${response.status}).`
            );
        }

        const account = await response.json();

        let session;

        try {
            session = convertAccount(account, role);
        } catch (error) {
            await fetch('/api/Auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            setUser(null);
            throw error;
        }

        setUser(session);
        return session;
    }

    async function signUp() {
        throw new Error(
            'Account registration is not connected yet. Use an existing backend account.'
        );
    }

    async function logout() {
        const response = await fetch('/api/Auth/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Could not log out (${response.status}).`);
        }

        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{ user, loading, login, signUp, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}