// src/components/PublicRoute.js
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';

export function PublicRoute({ children }) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading && user) {
            // Se for admin, redireciona para dashboard
            if (user.role === 'ROLE_ADMIN') {
                navigate('/admin/dashboard', { replace: true });
            }
            // Se for usuário normal e estiver em login/register, redireciona para home
            else if (location.pathname === '/' || location.pathname === '/register') {
                navigate('/home', { replace: true });
            }
        }
    }, [user, loading, navigate, location.pathname]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.2rem',
                color: '#667eea'
            }}>
                Carregando...
            </div>
        );
    }

    // Se for admin e tentar acessar rotas públicas, bloqueia
    if (user && user.role === 'ROLE_ADMIN' &&
        (location.pathname === '/' ||
            location.pathname === '/home' ||
            location.pathname === '/register' ||
            location.pathname.startsWith('/forgot-password'))) {
        navigate('/admin/dashboard', { replace: true });
        return null;
    }

    return children;
}
