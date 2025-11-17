import React, { useState, useEffect } from 'react';
import {
    Users,
    Gavel,
    Tag,
    MessageSquare,
    TrendingUp,
    Activity,
    DollarSign,
    Clock
} from 'lucide-react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import GenericLoader from '../../../components/GenericLoader/GenericLoader';
import Api from '../../../api/api';
import './styles.css';

function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAuctions: 0,
        totalCategories: 0,
        totalFeedbacks: 0,
        activeAuctions: 0,
        pendingAuctions: 0,
        totalRevenue: 0,
        recentActivities: []
    });

    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const [usersRes, categoriesRes, feedbackRes, auctionsRes] = await Promise.all([
                Api.get('/users').catch(() => ({ data: [] })),
                Api.get('/categories').catch(() => ({ data: [] })),
                Api.get('/feedbacks').catch(() => ({ data: [] })),
                Api.get('/auctions').catch(() => ({ data: [] }))
            ]);

            const totalUsers = usersRes.data.data?.length || 0;
            const totalCategories = categoriesRes.data.data?.length || 0;
            const totalFeedbacks = feedbackRes.data.data?.length || 0;
            const totalAuctions = auctionsRes.data.data?.length || 0;

            setStats({
                totalUsers,
                totalAuctions,
                totalCategories,
                totalFeedbacks,
                activeAuctions: 0,
                pendingAuctions: 0,
                totalRevenue: 0,
                recentActivities: []
            });

            setupCharts(totalUsers, totalCategories, totalFeedbacks);
        } catch (error) {
            console.error('Erro ao buscar dados do dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const setupCharts = (users, categories, feedbacks) => {
        const data = {
            labels: ['Usuários', 'Categorias', 'Feedbacks', 'Leilões'],
            datasets: [
                {
                    label: 'Total',
                    data: [users, categories, feedbacks, 0],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(118, 75, 162, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(16, 185, 129, 0.8)'
                    ],
                    borderColor: [
                        'rgb(102, 126, 234)',
                        'rgb(118, 75, 162)',
                        'rgb(245, 158, 11)',
                        'rgb(16, 185, 129)'
                    ],
                    borderWidth: 2
                }
            ]
        };

        const options = {
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        };

        setChartData(data);
        setChartOptions(options);
    };

    const StatCard = ({ icon: Icon, title, value, color, trend }) => (
        <div className="stat-card" style={{ borderTopColor: color }}>
            <div className="stat-icon" style={{ background: `${color}20`, color: color }}>
                <Icon size={24} />
            </div>
            <div className="stat-content">
                <span className="stat-title">{title}</span>
                <div className="stat-value-row">
                    <span className="stat-value">{value}</span>
                    {trend && (
                        <span className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
                            <TrendingUp size={14} />
                            {Math.abs(trend)}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    if (loading) {
        return <GenericLoader />;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Dashboard</h1>
                    <p className="dashboard-subtitle">Bem-vindo ao painel administrativo</p>
                </div>
                <button className="refresh-button" onClick={fetchDashboardData}>
                    <Activity size={18} />
                    Atualizar
                </button>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatCard
                    icon={Users}
                    title="Total de Usuários"
                    value={stats.totalUsers}
                    color="#667eea"
                    trend={12}
                />
                <StatCard
                    icon={Gavel}
                    title="Total de Leilões"
                    value={stats.totalAuctions}
                    color="#764ba2"
                    trend={8}
                />
                <StatCard
                    icon={Tag}
                    title="Categorias"
                    value={stats.totalCategories}
                    color="#f59e0b"
                    trend={5}
                />
                <StatCard
                    icon={MessageSquare}
                    title="Feedbacks"
                    value={stats.totalFeedbacks}
                    color="#10b981"
                    trend={15}
                />
            </div>

            <div className="dashboard-grid">
                <div className="chart-container">
                    <Card title="Visão Geral do Sistema">
                        <Chart type="bar" data={chartData} options={chartOptions} />
                    </Card>
                </div>

                <div className="activity-container">
                    <Card title="Resumo Rápido">
                        <div className="quick-stats">
                            <div className="quick-stat-item">
                                <div className="quick-stat-icon active">
                                    <Gavel size={20} />
                                </div>
                                <div className="quick-stat-info">
                                    <span className="quick-stat-label">Leilões Ativos</span>
                                    <span className="quick-stat-value">{stats.activeAuctions}</span>
                                </div>
                            </div>

                            <div className="quick-stat-item">
                                <div className="quick-stat-icon pending">
                                    <Clock size={20} />
                                </div>
                                <div className="quick-stat-info">
                                    <span className="quick-stat-label">Leilões Pendentes</span>
                                    <span className="quick-stat-value">{stats.pendingAuctions}</span>
                                </div>
                            </div>

                            <div className="quick-stat-item">
                                <div className="quick-stat-icon revenue">
                                    <DollarSign size={20} />
                                </div>
                                <div className="quick-stat-info">
                                    <span className="quick-stat-label">Receita Total</span>
                                    <span className="quick-stat-value">
                                        R$ {stats.totalRevenue.toLocaleString('pt-BR')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity">
                <Card title="Atividades Recentes">
                    {stats.recentActivities.length > 0 ? (
                        <div className="activity-list">
                            {stats.recentActivities.map((activity, index) => (
                                <div key={index} className="activity-item">
                                    <div className="activity-dot"></div>
                                    <div className="activity-content">
                                        <p className="activity-text">{activity.text}</p>
                                        <span className="activity-time">{activity.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-activity">
                            <Activity size={48} color="#d1d5db" />
                            <p>Nenhuma atividade recente</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

export default Dashboard;
