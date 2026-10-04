import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import Layout from './components/Layout';
import { AuthProvider, useAuth, ROLES, homeFor } from './context/AuthContext';

import Login from './pages/Login';

import Dashboard from './pages/Dashboard';
import GymMembers from './pages/GymMembers';
import Trainers from './pages/Trainers';
import Programmes from './pages/Programmes';
import Assignments from './pages/Assignments';

import Member from './pages/Member';
import MemberProfile from './pages/MemberProfile';
import MemberProgramme from './pages/MemberProgramme';
import MemberWorkoutPlans from './pages/MemberWorkoutPlans';
import MemberTasks from './pages/MemberTasks';

import TrainerDashboard from './pages/trainer/TrainerDashboard';
import TrainerMembers from './pages/trainer/TrainerMembers';
import TrainerProgrammes from './pages/trainer/TrainerProgrammes';
import TrainerPlans from './pages/trainer/TrainerPlans';
import TrainerTasks from './pages/trainer/TrainerTasks';

// Must be signed in; wraps every page in the shared Layout
function AuthLayout() {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return <Layout><Outlet /></Layout>;
}

// Only lets the given role through; others go back to their own dashboard
function RoleRoute({ role }) {
    const { user } = useAuth();
    return user.role === role ? <Outlet /> : <Navigate to={homeFor(user.role)} replace />;
}

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<AuthLayout />}>
                        {/* Administrator */}
                        <Route element={<RoleRoute role={ROLES.ADMIN} />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/members" element={<GymMembers />} />
                            <Route path="/trainers" element={<Trainers />} />
                            <Route path="/programmes" element={<Programmes />} />
                            <Route path="/assignments" element={<Assignments />} />
                        </Route>

                        {/* Personal Trainer */}
                        <Route element={<RoleRoute role={ROLES.TRAINER} />}>
                            <Route path="/trainer" element={<TrainerDashboard />} />
                            <Route path="/trainer/members" element={<TrainerMembers />} />
                            <Route path="/trainer/programmes" element={<TrainerProgrammes />} />
                            <Route path="/trainer/plans" element={<TrainerPlans />} />
                            <Route path="/trainer/plans/:planId/tasks" element={<TrainerTasks />} />
                        </Route>

                        {/* Gym Member */}
                        <Route element={<RoleRoute role={ROLES.MEMBER} />}>
                            <Route path="/member" element={<Member />} />
                            <Route path="/member/profile" element={<MemberProfile />} />
                            <Route path="/member/programme" element={<MemberProgramme />} />
                            <Route path="/member/workouts" element={<MemberWorkoutPlans />} />
                            <Route path="/member/tasks" element={<MemberTasks />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}
