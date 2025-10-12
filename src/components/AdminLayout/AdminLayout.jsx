import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import {
    LayoutDashboard,
    Users,
    Gavel,
    Tag,
    MessageSquare,
    LogOut,
    Menu,
    X,
    ChevronRight
} from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            title: 'Dashboard',
            icon: LayoutDashboard,
            path: '/admin/dashboard',
            description: 'Visão geral do sistema'
        },
        {
            title: 'Usuários',
            icon: Users,
            path: '/admin/users',
            description: 'Gerenciar usuários'
        },
        {
            title: 'Leilões',
            icon: Gavel,
            path: '/admin/auctions',
            description: 'Gerenciar leilões'
        },
        {
            title: 'Categorias',
            icon: Tag,
            path: '/admin/categories',
            description: 'Gerenciar categorias'
        },
        {
            title: 'Feedbacks',
            icon: MessageSquare,
            path: '/admin/feedback',
            description: 'Gerenciar feedbacks'
        }
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.key === 'b') {
                event.preventDefault();
                toggleSidebar();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [sidebarOpen]); // Dependência: quando sidebarOpen muda, recria o listener

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo-section">
                        {sidebarOpen && (
                            <>
                                <div className="logo-icon">
                                    <Gavel size={28} />
                                </div>
                                <div className="logo-text">
                                    <h2>Admin Panel</h2>
                                    <span>Sistema de Leilões</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <ul className="menu-list">
                        {menuItems.map((item, index) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);

                            return (
                                <li key={index} className="menu-item">
                                    <button
                                        className={`menu-button ${active ? 'active' : ''}`}
                                        onClick={() => navigate(item.path)}
                                        title={!sidebarOpen ? item.title : ''}
                                    >
                                        <Icon size={20} className="menu-icon" />
                                        {sidebarOpen && (
                                            <>
                                                <span className="menu-text">
                                                    <span className="menu-title">{item.title}</span>
                                                    <span className="menu-description">{item.description}</span>
                                                </span>
                                                {active && <ChevronRight size={16} className="active-indicator" />}
                                            </>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-button" onClick={handleLogout}>
                        <LogOut size={20} />
                        {sidebarOpen && <span>Sair</span>}
                    </button>
                </div>
            </aside>

            <div className={`admin-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <header className="admin-header">
                    <button
                        className="toggle-sidebar-btn"
                        onClick={toggleSidebar}
                        title="Alternar Sidebar (Ctrl + B)"
                    >
                        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div className="header-right">
                        <div className="user-info">
                            <div className="user-avatar">
                                {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="user-details">
                                <span className="user-name">{user?.name || 'Administrador'}</span>
                                <span className="user-role">Administrador</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
