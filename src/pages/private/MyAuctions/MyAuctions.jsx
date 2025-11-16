import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useAllAuctionsUser } from '../../../hooks/useAllAuctionUser';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import Api from '../../../api/api';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import {
    TrendingUp,
    Trophy,
    AlertCircle,
    Clock,
    Gavel,
    CheckCircle,
    XCircle,
    Calendar,
    Tag
} from 'lucide-react';
import './MyAuctions.css';
import { useNavigate } from 'react-router';

function MyAuctions() {
    const { user } = useAuth();
    const { auctions, isLoading } = useAllAuctionsUser(user?.id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('all'); // all, winning, losing, finished

    // Estados do Modal de Feedback
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [comment, setComment] = useState('');
    const [note, setNote] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatCurrency = (value) => {
        if (!value && value !== 0) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeRemaining = (endTime) => {
        if (!endTime) return 'Data não definida';

        const now = new Date();
        const end = new Date(endTime);
        const diff = end - now;

        if (diff <= 0) return 'Encerrado';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            'EM_ANALISE': { label: 'Em Análise', color: '#f59e0b', icon: <AlertCircle size={18} /> },
            'ABERTO': { label: 'Ativo', color: '#10b981', icon: <CheckCircle size={18} /> },
            'ENCERRADO': { label: 'Finalizado', color: '#6b7280', icon: <XCircle size={18} /> },
            'CANCELADO': { label: 'Cancelado', color: '#ef4444', icon: <XCircle size={18} /> }
        };
        return statusMap[status] || { label: status, color: '#6b7280', icon: <AlertCircle size={18} /> };
    };

    const openFeedbackModal = (auction, e) => {
        e.stopPropagation();
        setSelectedAuction(auction);
        setComment('');
        setNote(0);
        setShowFeedbackModal(true);
    };

    const closeFeedbackModal = () => {
        setShowFeedbackModal(false);
        setSelectedAuction(null);
        setComment('');
        setNote(0);
        setIsSubmitting(false);
    };

    const handleSubmitFeedback = async () => {
        if (!comment.trim()) {
            toast.error('Por favor, informe o comentário');
            return;
        }

        if (note === 0) {
            toast.error('Por favor, selecione uma nota de 1 a 5 estrelas');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await Api.post('/feedbacks', {
                comment: comment.trim(),
                note: note,
                author: { id_user: user.id },
                recipient: { id_user: selectedAuction.user.id }
            });

            if (response.status === 200) {
                await queryClient.invalidateQueries(['all_feedback']);
                toast.success('Feedback enviado com sucesso!');
                closeFeedbackModal();
            } else {
                toast.error('Erro ao enviar feedback. Tente novamente.');
            }
        } catch (error) {
            toast.error(`Erro ao enviar feedback. Tente novamente. ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const StarRating = ({ value, onChange }) => {
        const [hoveredStar, setHoveredStar] = useState(0);

        return (
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                    <i
                        key={star}
                        className={`pi pi-star${(hoveredStar >= star || value >= star) ? '-fill' : ''} star ${(hoveredStar >= star || value >= star) ? 'filled' : ''}`}
                        onClick={() => onChange(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                    />
                ))}
                <span style={{ marginLeft: '8px', color: '#6b7280', fontSize: '0.9rem' }}>
                    {value > 0 ? `${value} de 5 estrelas` : 'Clique para avaliar'}
                </span>
            </div>
        );
    };

    const filteredAuctions = auctions?.filter(auction => {
        if (filter === 'all') return true;
        if (filter === 'winning') return auction.isUserWinning && auction.status === 'ABERTO';
        if (filter === 'losing') return !auction.isUserWinning && auction.status === 'ABERTO';
        if (filter === 'finished') return auction.status === 'ENCERRADO';
        return true;
    });

    if (isLoading) {
        return (
            <>
                <Header />
                <div className="loading-container">
                    <div className="spinner-large"></div>
                    <p>Carregando seus leilões...</p>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="my-auctions-container">
                <div className="my-auctions-header">
                    <h1>
                        <Gavel size={32} />
                        Meus Leilões
                    </h1>
                    <p>Acompanhe todos os leilões em que você está participando</p>
                </div>

                {/* Filtros */}
                <div className="auctions-filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Todos ({auctions?.length || 0})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'winning' ? 'active' : ''}`}
                        onClick={() => setFilter('winning')}
                    >
                        <Trophy size={18} />
                        Vencendo ({auctions?.filter(a => a.isUserWinning && a.status === 'ABERTO').length || 0})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'losing' ? 'active' : ''}`}
                        onClick={() => setFilter('losing')}
                    >
                        <TrendingUp size={18} />
                        Perdendo ({auctions?.filter(a => !a.isUserWinning && a.status === 'ABERTO').length || 0})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'finished' ? 'active' : ''}`}
                        onClick={() => setFilter('finished')}
                    >
                        <CheckCircle size={18} />
                        Finalizados ({auctions?.filter(a => a.status === 'ENCERRADO').length || 0})
                    </button>
                </div>

                {/* Lista de Leilões */}
                {!filteredAuctions || filteredAuctions.length === 0 ? (
                    <div className="empty-state">
                        <Gavel size={64} />
                        <h2>Nenhum leilão encontrado</h2>
                        <p>Você ainda não participou de nenhum leilão com este filtro.</p>
                        <button onClick={() => navigate('/')} className="btn-home">
                            Ver Leilões Disponíveis
                        </button>
                    </div>
                ) : (
                    <div className="auctions-grid">
                        {filteredAuctions.map((auction) => {
                            const statusInfo = getStatusInfo(auction.status);
                            const isActive = auction.status === 'ABERTO';

                            return (
                                <div
                                    key={auction.idAuction}
                                    className={`auction-participation-card ${auction.isUserWinning ? 'winning' : ''}`}
                                    onClick={() => navigate(`/auction/${auction.idAuction}`)}
                                >
                                    {/* Badge Vencendo */}
                                    {auction.isUserWinning && isActive && (
                                        <div className="winning-badge">
                                            <Trophy size={16} />
                                            Você está vencendo!
                                        </div>
                                    )}

                                    {/* Imagem */}
                                    <div className="auction-card-image">
                                        <img
                                            src={auction.images[0] || 'https://via.placeholder.com/400x300?text=Sem+Imagem'}
                                            alt={auction.title}
                                        />
                                        <div className="status-badge-overlay" style={{ backgroundColor: statusInfo.color }}>
                                            {statusInfo.icon}
                                            <span>{statusInfo.label}</span>
                                        </div>
                                        {auction.category && (
                                            <div className="category-badge-overlay">
                                                <Tag size={14} />
                                                {auction.category.name}
                                            </div>
                                        )}
                                    </div>

                                    {/* Conteúdo */}
                                    <div className="auction-card-content">
                                        <h3>{auction.title}</h3>
                                        <p className="auction-description">{auction.description}</p>

                                        {/* Estatísticas do Usuário */}
                                        <div className="user-stats">
                                            <div className="stat-item">
                                                <span className="stat-label">Seus Lances</span>
                                                <span className="stat-value">{auction.userBidCount}</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-label">Seu Maior Lance</span>
                                                <span className="stat-value highlight">{formatCurrency(auction.userHighestBid)}</span>
                                            </div>
                                        </div>

                                        {/* Informações Atuais */}
                                        <div className="current-info">
                                            <div className="info-row">
                                                <span className="info-label">Lance Atual:</span>
                                                <span className="info-value price">{formatCurrency(auction.currentBid)}</span>
                                            </div>
                                            {auction.currentBidUser && (
                                                <div className="info-row">
                                                    <span className="info-label">Líder Atual:</span>
                                                    <span className={`info-value ${auction.isUserWinning ? 'you' : ''}`}>
                                                        {auction.currentBidUser.name}
                                                        {auction.isUserWinning && ' (Você)'}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="info-row">
                                                <span className="info-label">Total de Lances:</span>
                                                <span className="info-value">{auction.totalBids}</span>
                                            </div>
                                        </div>

                                        {/* Último Lance */}
                                        {auction.userLatestBidTime && (
                                            <div className="latest-bid-info">
                                                <Clock size={14} />
                                                <span>Seu último lance: {formatDate(auction.userLatestBidTime)}</span>
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="auction-card-footer">
                                            {isActive ? (
                                                <>
                                                    <div className="time-remaining">
                                                        <Clock size={16} />
                                                        {getTimeRemaining(auction.endTime)}
                                                    </div>
                                                    <div className="next-bid">
                                                        Próximo: {formatCurrency(auction.nextMinimumBid)}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="auction-card-footer">
                                                    <div className="auction-ended">
                                                        <Calendar size={16} />
                                                        Finalizado em {formatDate(auction.endTime)}
                                                    </div>
                                                    <div className="send-feedback">
                                                        <button onClick={(e) => openFeedbackModal(auction, e)}>
                                                            Enviar Feedback
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal de Feedback */}
            <Dialog
                header={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 2000 }}>
                        <i className="pi pi-star" style={{ color: '#ffffff', fontSize: '1.2rem' }} />
                        <span style={{ fontSize: '1.3rem', fontWeight: '600', color: '#ffffff' }}>
                            Enviar Feedback para {selectedAuction?.user?.name}
                        </span>
                    </div>
                }
                visible={showFeedbackModal}
                style={{ width: '600px', zIndex: 10000 }}
                modal
                onHide={closeFeedbackModal}
                className="feedback-modal"
                maskClassName="feedback-modal"
                appendTo={document.body}
                baseZIndex={9999}
                headerStyle={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                    padding: '1rem 1.5rem'
                }}
                contentStyle={{
                    padding: '2rem',
                    backgroundColor: '#f8fafc'
                }}
                draggable={false}
                resizable={false}
            >
                <div className="modal-content">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '1rem',
                                fontWeight: '500',
                                color: '#374151'
                            }}
                        >
                            Leilão: {selectedAuction?.title}
                        </label>
                        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                            Avalie sua experiência com o leiloeiro deste leilão
                        </p>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label
                            htmlFor="note"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '1rem',
                                fontWeight: '500',
                                color: '#374151'
                            }}
                        >
                            Avaliação *
                        </label>
                        <StarRating value={note} onChange={setNote} />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label
                            htmlFor="comment"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '1rem',
                                fontWeight: '500',
                                color: '#374151'
                            }}
                        >
                            Comentário *
                        </label>
                        <InputTextarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Digite seu comentário sobre o leiloeiro..."
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                fontSize: '1rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                transition: 'all 0.3s ease',
                                backgroundColor: 'white',
                                resize: 'vertical'
                            }}
                            className="feedback-input"
                        />
                    </div>

                    <Divider style={{ margin: '1.5rem 0' }} />

                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        paddingTop: '1rem'
                    }}>
                        <Button
                            label="Cancelar"
                            icon="pi pi-times"
                            severity="secondary"
                            outlined
                            onClick={closeFeedbackModal}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                fontWeight: '500'
                            }}
                            disabled={isSubmitting}
                        />
                        <Button
                            label="Enviar Feedback"
                            icon={isSubmitting ? "pi pi-spin pi-spinner" : "pi pi-check"}
                            severity="warning"
                            onClick={handleSubmitFeedback}
                            loading={isSubmitting}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                fontWeight: '500',
                                background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                                border: 'none',
                                color: 'white'
                            }}
                        />
                    </div>
                </div>
            </Dialog>

            <Footer />
        </>
    );
}

export default MyAuctions;
