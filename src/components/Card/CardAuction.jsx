import React from 'react';
import './CardAuction.css';
import { NavLink } from 'react-router';
import { Carousel } from 'primereact/carousel';
import { Clock, TrendingUp, Users, Tag } from 'lucide-react';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';

export default function CardAuction({
    idAuction = "",
    title = "",
    description = "",
    images = [],
    minimumBid = 0,
    currentBid = null,
    totalBids = 0,
    startTime = "",
    endTime = "",
    status = "",
    category = null,
    nextMinimumBid = 0,
    disableSlideImgs = false,
}) {
    // Formata data
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calcula tempo restante
    const getTimeRemaining = () => {
        if (!endTime) return 'N/A';
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

    // Status badge
    const getStatusBadge = () => {
        const statusConfig = {
            EM_ANALISE: { label: 'Em Análise', color: '#f59e0b', bgColor: '#fef3c7' },
            ABERTO: { label: 'Ativo', color: '#10b981', bgColor: '#d1fae5' },
            ENCERRADO: { label: 'Finalizado', color: '#6b7280', bgColor: '#f3f4f6' },
            CANCELADO: { label: 'Cancelado', color: '#ef4444', bgColor: '#fee2e2' }
        };
        const config = statusConfig[status] || statusConfig.EM_ANALISE;
        return config;
    };

    const statusStyle = getStatusBadge();

    const carouselTemplate = (url) => (
        <div className="carousel-image-container">
            <img src={url} alt="Auction Item" className="card-img-modern" />
        </div>
    );

    const carouselSettings = {
        numVisible: 1,
        numScroll: 1,
        circular: true,
        autoplayInterval: 5000,
        showNavigators: false,
        showIndicators: true,
    };

    return (
        <div className="auction-card-modern">
            {/* Badge de Status */}
            <div
                className="status-badge-card"
                style={{
                    backgroundColor: statusStyle.bgColor,
                    color: statusStyle.color
                }}
            >
                {statusStyle.label}
            </div>

            {/* Imagem/Carousel */}
            <div className="card-image-section">
                {!disableSlideImgs && images.length > 1 ? (
                    <Carousel
                        value={images}
                        itemTemplate={carouselTemplate}
                        {...carouselSettings}
                    />
                ) : (
                    <img
                        src={images[0] || 'https://via.placeholder.com/400x300?text=Sem+Imagem'}
                        alt={title}
                        className="card-img-modern"
                    />
                )}

                {/* Categoria */}
                {category && (
                    <div className="category-badge">
                        <Tag size={14} />
                        <span>{category.name}</span>
                    </div>
                )}
            </div>

            {/* Conteúdo */}
            <div className="card-content-modern">
                <h3 className="card-title-modern">{title}</h3>
                <p className="card-description-modern">{description}</p>

                {/* Grid de Informações */}
                <div className="card-info-grid">
                    {/* Lance Atual ou Mínimo */}
                    <div className="info-item-modern">
                        <div className="info-label">
                            <TrendingUp size={16} />
                            {currentBid ? 'Lance Atual' : 'Lance Mínimo'}
                        </div>
                        <div className="info-value-price">
                            {parseFloat(currentBid || minimumBid).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            })}
                        </div>
                    </div>

                    {/* Próximo Lance */}
                    <div className="info-item-modern">
                        <div className="info-label">Próximo Lance</div>
                        <div className="info-value-next">
                            {parseFloat(nextMinimumBid).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            })}
                        </div>
                    </div>
                </div>

                {/* Tempo Restante e Total de Lances */}
                <div className="card-footer-info">
                    <div className="footer-item">
                        <Clock size={16} />
                        <span>{getTimeRemaining()}</span>
                    </div>
                    {totalBids > 0 && (
                        <div className="footer-item">
                            <Users size={16} />
                            <span>{totalBids} lance(s)</span>
                        </div>
                    )}
                </div>

                {/* Botão */}
                <NavLink
                    to={`/auction/${idAuction}`}
                    className="btn-card-modern"
                >
                    {status === 'ATIVO' ? 'Fazer Lance' : 'Ver Detalhes'}
                </NavLink>
            </div>
        </div>
    );
}