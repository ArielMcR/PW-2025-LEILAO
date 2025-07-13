// src/components/PrivateRoute.js
import { Outlet, useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';

export function PrivateRoute({ allowedRoles }) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) return <div>Carregando...</div>;

    if (!user) {
        return navigate('/home');
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return navigate('/home');
    }

    return <Outlet />;
}