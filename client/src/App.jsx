import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { ChangePassword } from './pages/ChangePassword';
import { Dashboard } from './pages/Dashboard';
import { RelevesList } from './pages/RelevesList';
import { ReleveDetail } from './pages/ReleveDetail';
import { ReleveAdd } from './pages/ReleveAdd';
import { AgentsList } from './pages/AgentsList';
import { AgentDetail } from './pages/AgentDetail';
import { CompteursList } from './pages/CompteursList';
import { CompteurDetail } from './pages/CompteurDetail';
import { CompteurAdd } from './pages/CompteurAdd';
import { Rapports } from './pages/Rapports';
import { UsersList } from './pages/UsersList';
import { UserDetail } from './pages/UserDetail';
import { UserAdd } from './pages/UserAdd';

// Redirect based on role
const HomeRedirect = () => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return <Navigate to={user.role === 'SUPERADMIN' ? '/admin/users' : '/dashboard'} replace />;
};

function App() {
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
                <Routes>
                    {/* Public Route */}
                    <Route path="/login" element={<Login />} />

                    {/* Common Protected Routes */}
                    <Route
                        path="/change-password"
                        element={
                            <ProtectedRoute>
                                <ChangePassword />
                            </ProtectedRoute>
                        }
                    />

                    {/* USER Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['USER']}>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/releves"
                        element={
                            <ProtectedRoute allowedRoles={['USER']}>
                                <RelevesList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/releves/:id"
                        element={
                            <ProtectedRoute allowedRoles={['USER']}>
                                <ReleveDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/agents"
                        element={
                            <ProtectedRoute allowedRoles={['USER']}>
                                <AgentsList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/agents/:id"
                        element={
                            <ProtectedRoute allowedRoles={['USER']}>
                                <AgentDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/compteurs"
                        element={
                            <ProtectedRoute allowedRoles={['USER']}>
                                <CompteursList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/compteurs/:id"
                        element={
                            <ProtectedRoute allowedRoles={['USER']}>
                                <CompteurDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/compteurs/nouveau"
                        element={
                            <ProtectedRoute allowedRoles={['USER']}>
                                <CompteurAdd />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/rapports"
                        element={
                            <ProtectedRoute allowedRoles={['USER']}>
                                <Rapports />
                            </ProtectedRoute>
                        }
                    />

                    {/* SUPERADMIN Routes */}
                    <Route
                        path="/admin/users"
                        element={
                            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                                <UsersList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/users/:id"
                        element={
                            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                                <UserDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/users/add"
                        element={
                            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                                <UserAdd />
                            </ProtectedRoute>
                        }
                    />

                    {/* Compteurs Routes */}
                    <Route
                        path="/admin/compteurs"
                        element={
                            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                                <CompteursList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/compteurs/:id"
                        element={
                            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                                <CompteurDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/compteurs/add"
                        element={
                            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                                <CompteurAdd />
                            </ProtectedRoute>
                        }
                    />

                    {/* Relevés Routes */}
                    <Route
                        path="/admin/releves"
                        element={
                            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                                <RelevesList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/releves/:id"
                        element={
                            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                                <ReleveDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/releves/add"
                        element={
                            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                                <ReleveAdd />
                            </ProtectedRoute>
                        }
                    />

                    {/* Default Route */}
                    <Route path="/" element={<HomeRedirect />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
