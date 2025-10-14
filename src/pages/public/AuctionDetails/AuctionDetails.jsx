import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuctions } from '../../../hooks/useAuction';
import { useAuth } from '../../../hooks/useAuth';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import { Carousel } from 'primereact/carousel';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import {
    Clock,
    TrendingUp,
    Users,
    Tag,
    Gavel,
    Calendar,
    User,
    Phone,
    Mail,
    AlertCircle,
    CheckCircle,
    XCircle,
    ArrowLeft
} from 'lucide-react';
import './AuctionDetails.css';

function AuctionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { auction, isLoading } = useAuctions(id);
    const { user } = useAuth();
    const [bidAmount, setBidAmount] = useState(null);
    const [showBidDialog, setShowBidDialog] = useState(false);

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

    const formatCurrency = (value) => {
        if (!value && value !== 0) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
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
            'EM_ANALISE': { label: 'Em Análise', color: '#f59e0b', icon: <AlertCircle size={20} /> },
            'ATIVO': { label: 'Ativo', color: '#10b981', icon: <CheckCircle size={20} /> },
            'FINALIZADO': { label: 'Finalizado', color: '#6b7280', icon: <XCircle size={20} /> },
            'CANCELADO': { label: 'Cancelado', color: '#ef4444', icon: <XCircle size={20} /> }
        };
        return statusMap[status] || { label: status, color: '#6b7280', icon: <AlertCircle size={20} /> };
    };

    const handleBidClick = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setBidAmount(auction?.nextMinimumBid || auction?.minimumBid);
        setShowBidDialog(true);
    };

    const handleSubmitBid = () => {
        // TODO: Implementar lógica de lance
        console.log('Lance de:', bidAmount);
        setShowBidDialog(false);
    };

    const imageTemplate = (image) => {
        return (
            <div className="auction-image-container">
                <img src={image} alt="Leilão" className="auction-detail-image" />
            </div>
        );
    };

    if (isLoading) {
        return (
            <>
                <Header />
                <div className="loading-container">
                    <div className="spinner-large"></div>
                    <p>Carregando detalhes do leilão...</p>
                </div>
                <Footer />
            </>
        );
    }

    if (!auction) {
        return (
            <>
                <Header />
                <div className="error-container">
                    <AlertCircle size={64} />
                    <h2>Leilão não encontrado</h2>
                    <Button
                        label="Voltar para Home"
                        icon={<ArrowLeft size={18} />}
                        onClick={() => navigate('/')}
                        className="back-btn"
                    />
                </div>
                <Footer />
            </>
        );
    }

    const statusInfo = getStatusInfo(auction.status);
    const isActive = auction.status === 'ATIVO';
    const timeRemaining = getTimeRemaining(auction.endTime);

    return (
        <>
            <Header />
            <div className="auction-details-container">
                {console.log(auction)}
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <Button
                        label="Voltar"
                        icon={<ArrowLeft size={18} />}
                        onClick={() => navigate('/')}
                        className="back-button"
                        text
                    />
                </div>

                <div className="auction-details-content">
                    {/* Coluna Esquerda - Imagens */}
                    <div className="auction-images-section">
                        {auction.images && auction.images.length > 0 ? (
                            auction.images.length === 1 ? (
                                <div className="single-image-container">
                                    <img src={auction.images[0]} alt={auction.title} className="auction-detail-image" />
                                </div>
                            ) : (
                                <Carousel
                                    value={auction.images}
                                    itemTemplate={imageTemplate}
                                    numVisible={1}
                                    numScroll={1}
                                    showIndicators
                                    showThumbnails={false}
                                    className="auction-carousel"
                                />
                            )
                        ) : (
                            <div className="no-image-container">
                                <Gavel size={80} />
                                <p>Sem imagens disponíveis</p>
                            </div>
                        )}

                        {/* Status Badge */}
                        <div
                            className="status-badge-detail"
                            style={{ backgroundColor: statusInfo.color }}
                        >
                            {statusInfo.icon}
                            <span>{statusInfo.label}</span>
                        </div>

                        {/* Category Badge */}
                        {auction.category && (
                            <div className="category-badge-detail">
                                <Tag size={18} />
                                <span>{auction.category.name}</span>
                            </div>
                        )}
                    </div>

                    {/* Coluna Direita - Informações */}
                    <div className="auction-info-section">
                        {/* Título */}
                        <h1 className="auction-title">{auction.title}</h1>

                        {/* Descrição */}
                        <p className="auction-description">{auction.description}</p>

                        {/* Informações de Lance */}
                        <div className="bid-info-card">
                            <div className="bid-info-row">
                                <div className="bid-info-item">
                                    <TrendingUp size={24} color="#001E45" />
                                    <div className="bid-info-content">
                                        <span className="bid-label">Lance Atual</span>
                                        <span className="bid-value">{formatCurrency(auction.currentBid || 0)}</span>
                                    </div>
                                </div>
                                <div className="bid-info-item">
                                    <Gavel size={24} color="#001E45" />
                                    <div className="bid-info-content">
                                        <span className="bid-label">Lance Mínimo</span>
                                        <span className="bid-value">{formatCurrency(auction.minimumBid)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bid-info-row">
                                <div className="bid-info-item">
                                    <Tag size={24} color="#001E45" />
                                    <div className="bid-info-content">
                                        <span className="bid-label">Próximo Lance</span>
                                        <span className="bid-value-highlight">{formatCurrency(auction.nextMinimumBid)}</span>
                                    </div>
                                </div>
                                <div className="bid-info-item">
                                    <Users size={24} color="#001E45" />
                                    <div className="bid-info-content">
                                        <span className="bid-label">Total de Lances</span>
                                        <span className="bid-value">{auction.totalBids}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tempo Restante */}
                        {isActive && (
                            <div className="time-remaining-card">
                                <Clock size={28} />
                                <div>
                                    <span className="time-label">Tempo Restante</span>
                                    <span className="time-value">{timeRemaining}</span>
                                </div>
                            </div>
                        )}

                        {/* Botão de Lance */}
                        {isActive ? (
                            <Button
                                label={user ? "Fazer Lance" : "Entrar para Dar Lance"}
                                icon={<Gavel size={20} />}
                                onClick={handleBidClick}
                                className="bid-button"
                            />
                        ) : (
                            <div className="auction-closed-message">
                                <AlertCircle size={24} />
                                <span>Este leilão não está mais ativo</span>
                            </div>
                        )}

                        {/* Descrição Detalhada */}
                        {auction.detailedDescription && (
                            <div className="detailed-description-card">
                                <h3>Descrição Detalhada</h3>
                                <p>{auction.detailedDescription}</p>
                            </div>
                        )}

                        {/* Informações Adicionais */}
                        <div className="additional-info-card">
                            <h3>Informações do Leilão</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <Calendar size={20} />
                                    <div>
                                        <span className="info-label">Início</span>
                                        <span className="info-value">{formatDate(auction.startTime)}</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <Calendar size={20} />
                                    <div>
                                        <span className="info-label">Término</span>
                                        <span className="info-value">{formatDate(auction.endTime)}</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <TrendingUp size={20} />
                                    <div>
                                        <span className="info-label">Incremento</span>
                                        <span className="info-value">{formatCurrency(auction.valueIncrement)}</span>
                                    </div>
                                </div>
                                {auction.currentBidUser && (
                                    <div className="info-item">
                                        <User size={20} />
                                        <div>
                                            <span className="info-label">Lance Mais Alto</span>
                                            <span className="info-value">{auction.currentBidUser}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Informações do Leiloeiro */}
                        {auction.user && (
                            <div className="auctioneer-info-card">
                                <h3>Informações do Leiloeiro</h3>
                                <div className="auctioneer-details">
                                    <div className="auctioneer-item">
                                        <User size={20} />
                                        <span>{auction.user.name}</span>
                                    </div>
                                    <div className="auctioneer-item">
                                        <Mail size={20} />
                                        <span>{auction.user.email}</span>
                                    </div>
                                    {auction.user.cellphone && (
                                        <div className="auctioneer-item">
                                            <Phone size={20} />
                                            <span>{auction.user.cellphone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Observações */}
                        {auction.observation && (
                            <div className="observation-card">
                                <h3>Observações</h3>
                                <p>{auction.observation}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Dialog de Lance */}
            <Dialog
                header="Fazer Lance"
                visible={showBidDialog}
                onHide={() => setShowBidDialog(false)}
                className="bid-dialog"
                modal
            >
                <div className="bid-dialog-content">
                    <p className="bid-dialog-info">
                        O lance mínimo para este leilão é <strong>{formatCurrency(auction?.nextMinimumBid)}</strong>
                    </p>
                    <div className="bid-input-group">
                        <label>Valor do Lance</label>
                        <InputNumber
                            value={bidAmount}
                            onValueChange={(e) => setBidAmount(e.value)}
                            mode="currency"
                            currency="BRL"
                            locale="pt-BR"
                            min={auction?.nextMinimumBid}
                            className="bid-input"
                        />
                    </div>
                    <div className="bid-dialog-actions">
                        <Button
                            label="Cancelar"
                            onClick={() => setShowBidDialog(false)}
                            className="cancel-bid-btn"
                            outlined
                        />
                        <Button
                            label="Confirmar Lance"
                            icon={<Gavel size={18} />}
                            onClick={handleSubmitBid}
                            className="confirm-bid-btn"
                            disabled={!bidAmount || bidAmount < auction?.nextMinimumBid}
                        />
                    </div>
                </div>
            </Dialog>

            <Footer />
        </>
    );
}

export default AuctionDetails;
