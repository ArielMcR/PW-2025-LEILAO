import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Gavel, Calendar, DollarSign, Clock, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from 'primereact/button';
import { DataView } from 'primereact/dataview';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar as PrimeCalendar } from 'primereact/calendar';
import { Divider } from 'primereact/divider';
import { classNames } from 'primereact/utils';
import { NavLink } from 'react-router';
import GenericLoader from '../../../components/GenericLoader/GenericLoader';
import { useAuth } from '../../../hooks/useAuth';
import Api from '../../../api/api';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useQueryClient } from '@tanstack/react-query';
import { useAllCars } from '../../../hooks/useAllCar';
import { useAllCategories } from '../../../hooks/useCategories';
import './styles.css';
import { useAuctions } from '../../../hooks/useAuctions';

function Auctions() {
    const { user } = useAuth();
    const [layout, setLayout] = useState('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const { auctions, isLoading } = useAuctions();
    const { categories, isLoading: categoriesLoading } = useAllCategories();
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);

    const [showModal, setShowModal] = useState(false);
    const [editingAuction, setEditingAuction] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        detailedDescription: '',
        startTime: null,
        endTime: null,
        observation: '',
        valueIncrement: '',
        minimumBid: '',
        categoryId: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const statusOptions = [
        { label: 'Pendente', value: 'PENDING' },
        { label: 'Ativo', value: 'ACTIVE' },
        { label: 'Finalizado', value: 'FINISHED' },
        { label: 'Cancelado', value: 'CANCELLED' }
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const clearSearch = () => {
        setSearchTerm('');
        setDebouncedSearch('');
    };

    const openModalForCreate = () => {
        setEditingAuction(null);
        setFormData({
            title: '',
            description: '',
            detailedDescription: '',
            startTime: null,
            endTime: null,
            observation: '',
            valueIncrement: '',
            minimumBid: '',
            categoryId: null
        });
        setSelectedImages([]);
        setImagePreviewUrls([]);
        setShowModal(true);
    };

    const openModalForEdit = (auction) => {
        setEditingAuction(auction);
        setFormData({
            title: auction.title || '',
            description: auction.description || '',
            detailedDescription: auction.detailedDescription || '',
            startTime: auction.startTime ? new Date(auction.startTime) : null,
            endTime: auction.endTime ? new Date(auction.endTime) : null,
            observation: auction.observation || '',
            valueIncrement: auction.valueIncrement || '',
            minimumBid: auction.minimumBid || '',
            categoryId: auction.category?.id_category || null
        });
        setSelectedImages([]);
        setImagePreviewUrls(auction.images || []);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingAuction(null);
        setFormData({
            title: '',
            description: '',
            detailedDescription: '',
            startTime: null,
            endTime: null,
            observation: '',
            valueIncrement: '',
            minimumBid: '',
            categoryId: null
        });
        setSelectedImages([]);
        setImagePreviewUrls([]);
        setIsSubmitting(false);
    };

    const clearFields = () => {
        setFormData({
            title: '',
            description: '',
            detailedDescription: '',
            startTime: null,
            endTime: null,
            observation: '',
            valueIncrement: '',
            minimumBid: '',
            categoryId: null
        });
        setSelectedImages([]);
        setImagePreviewUrls([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Função para lidar com seleção de imagens
    const handleImageSelect = (event) => {
        const files = Array.from(event.target.files);

        if (files.length + selectedImages.length > 10) {
            toast.warning('Você pode selecionar no máximo 10 imagens');
            return;
        }

        // Adiciona as novas imagens ao array
        setSelectedImages(prev => [...prev, ...files]);

        // Cria URLs de preview
        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    };

    // Função para remover uma imagem
    const handleRemoveImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));

        // Revoga a URL do preview para liberar memória
        if (imagePreviewUrls[index] && imagePreviewUrls[index].startsWith('blob:')) {
            URL.revokeObjectURL(imagePreviewUrls[index]);
        }

        setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    // Função para formatar data para LocalDateTime do Spring Boot
    const formatDateToLocalDateTime = (date) => {
        if (!date) return null;

        // Formata para o padrão que o Spring Boot espera: yyyy-MM-ddTHH:mm:ss
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const handleSubmit = async () => {
        // Validações
        if (!formData.title.trim()) {
            toast.error('Por favor, informe o título do leilão');
            return;
        }

        if (!formData.description.trim()) {
            toast.error('Por favor, informe a descrição');
            return;
        }

        if (!formData.minimumBid) {
            toast.error('Por favor, informe o lance mínimo');
            return;
        }

        if (!formData.valueIncrement) {
            toast.error('Por favor, informe o valor de incremento');
            return;
        }

        if (!formData.startTime) {
            toast.error('Por favor, informe a data de início');
            return;
        }

        if (!formData.endTime) {
            toast.error('Por favor, informe a data de término');
            return;
        }

        if (!formData.categoryId) {
            toast.error('Por favor, selecione uma categoria');
            return;
        }

        if (!user?.id) {
            toast.error('Usuário não identificado');
            return;
        }

        setIsSubmitting(true);

        try {
            // Cria FormData para enviar com multipart/form-data
            const formDataToSend = new FormData();

            // Adiciona os campos do leilão
            formDataToSend.append('title', formData.title.trim());
            formDataToSend.append('description', formData.description.trim());
            formDataToSend.append('detailedDescription', formData.detailedDescription?.trim() || '');
            formDataToSend.append('observation', formData.observation?.trim() || '');
            formDataToSend.append('valueIncrement', parseFloat(formData.valueIncrement));
            formDataToSend.append('minimumBid', parseFloat(formData.minimumBid));
            formDataToSend.append('userId', user.id);
            formDataToSend.append('categoryId', formData.categoryId);

            // Formata as datas para LocalDateTime do Spring Boot (sem timezone)
            if (formData.startTime) {
                formDataToSend.append('startTime', formatDateToLocalDateTime(formData.startTime));
            }
            if (formData.endTime) {
                formDataToSend.append('endTime', formatDateToLocalDateTime(formData.endTime));
            }

            // Adiciona as imagens
            selectedImages.forEach((image) => {
                formDataToSend.append('images', image);
            });

            if (editingAuction) {
                console.log(editingAuction)
                const response = await Api.put(`/auctions/${editingAuction.idAuction}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (response.status === 200) {
                    await queryClient.invalidateQueries(['all_auctions']);
                    toast.success('Leilão atualizado com sucesso!');
                    closeModal();
                }
            } else {
                const response = await Api.post('/auctions', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (response.status === 200 || response.status === 201) {
                    await queryClient.invalidateQueries(['all_auctions']);
                    toast.success('Leilão criado com sucesso!');
                    closeModal();
                }
            }
        } catch (error) {
            console.error('Erro ao enviar leilão:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                (editingAuction ? 'Erro ao atualizar leilão' : 'Erro ao criar leilão');
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Função para deletar leilão
    const handleDelete = (auction) => {
        Swal.fire({
            title: 'Excluir Leilão',
            text: `Tem certeza que deseja excluir o leilão "${auction.title}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
            focusCancel: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await Api.delete(`/auctions/${auction.idAuction}`);
                    if (response.status === 200 || response.status === 204) {
                        await queryClient.invalidateQueries(['all_auctions']);
                        toast.success('Leilão excluído com sucesso!');
                    } else {
                        toast.error('Erro ao excluir leilão. Tente novamente.');
                    }
                } catch (error) {
                    toast.error(`Erro ao excluir leilão. ${error.message}`);
                }
            }
        });
    };

    // Template para exibição em lista
    const listItem = (auction, index) => {
        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            return new Date(dateString).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const getStatusBadge = (status) => {
            const statusConfig = {
                EM_ANALISE: { label: 'Em Análise', color: '#f59e0b', bgColor: '#fef3c7' },
                ATIVO: { label: 'Ativo', color: '#10b981', bgColor: '#d1fae5' },
                FINALIZADO: { label: 'Finalizado', color: '#6b7280', bgColor: '#f3f4f6' },
                CANCELADO: { label: 'Cancelado', color: '#ef4444', bgColor: '#fee2e2' },
                PENDING: { label: 'Pendente', color: '#f59e0b', bgColor: '#fef3c7' },
                ACTIVE: { label: 'Ativo', color: '#10b981', bgColor: '#d1fae5' },
                FINISHED: { label: 'Finalizado', color: '#6b7280', bgColor: '#f3f4f6' },
                CANCELLED: { label: 'Cancelado', color: '#ef4444', bgColor: '#fee2e2' }
            };
            const config = statusConfig[status] || statusConfig.EM_ANALISE;
            return (
                <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: config.color,
                    backgroundColor: config.bgColor
                }}>
                    {config.label}
                </span>
            );
        };

        return (
            <div className="col-12" key={auction.idAuction}>
                <div
                    className="auction-card"
                    style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '16px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease',
                        border: '1px solid #e5e7eb'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <div className="flex flex-column xl:flex-row gap-4">
                        {/* Imagem do Leilão */}
                        <div style={{ flexShrink: 0 }}>
                            <img
                                src={auction.images && auction.images.length > 0 ? auction.images[0] : 'https://via.placeholder.com/300x200?text=Sem+Imagem'}
                                alt={auction.title}
                                style={{
                                    width: '240px',
                                    height: '180px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    border: '2px solid #f3f4f6'
                                }}
                            />
                        </div>

                        {/* Conteúdo Principal */}
                        <div className="flex-1" style={{ minWidth: 0 }}>
                            {/* Header com Título e Status */}
                            <div className="flex justify-content-between align-items-start mb-3">
                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: '#1f2937',
                                        marginBottom: '8px',
                                        lineHeight: '1.2'
                                    }}>
                                        {auction.title}
                                    </h3>
                                    <p style={{
                                        color: '#6b7280',
                                        fontSize: '0.95rem',
                                        margin: 0,
                                        lineHeight: '1.5'
                                    }}>
                                        {auction.description}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                    {auction.category && (
                                        <span style={{
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            color: '#6366f1',
                                            backgroundColor: '#e0e7ff',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            📁 {auction.category.name}
                                        </span>
                                    )}
                                    {getStatusBadge(auction.status)}
                                </div>
                            </div>

                            {/* Grid de Informações */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '16px',
                                marginBottom: '16px',
                                padding: '16px',
                                background: '#f9fafb',
                                borderRadius: '8px'
                            }}>
                                {/* Lance Mínimo */}
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>
                                        💰 Lance Mínimo
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10b981' }}>
                                        {parseFloat(auction.minimumBid || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </div>
                                </div>

                                {/* Lance Atual */}
                                {auction.currentBid && (
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>
                                            🎯 Lance Atual
                                        </div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#3b82f6' }}>
                                            {parseFloat(auction.currentBid).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </div>
                                        {auction.totalBids > 0 && (
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                                                {auction.totalBids} lance(s)
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Data de Início */}
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>
                                        🕐 Início
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>
                                        {formatDate(auction.startTime)}
                                    </div>
                                </div>

                                {/* Data de Término */}
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>
                                        🏁 Término
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>
                                        {formatDate(auction.endTime)}
                                    </div>
                                </div>
                            </div>

                            {/* Footer com Usuário e Ações */}
                            <div className="flex justify-content-between align-items-center">
                                {auction.user && (
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                        👤 Criado por: <span style={{ fontWeight: '600', color: '#374151' }}>{auction.user.name}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                    <Button
                                        icon="pi pi-pencil"
                                        rounded
                                        outlined
                                        severity="warning"
                                        aria-label="Editar"
                                        onClick={() => openModalForEdit(auction)}
                                        tooltip="Editar leilão"
                                        tooltipOptions={{ position: 'top' }}
                                        style={{ width: '40px', height: '40px' }}
                                    />
                                    <Button
                                        icon="pi pi-trash"
                                        rounded
                                        outlined
                                        severity="danger"
                                        aria-label="Excluir"
                                        onClick={() => handleDelete(auction)}
                                        tooltip="Excluir leilão"
                                        tooltipOptions={{ position: 'top' }}
                                        style={{ width: '40px', height: '40px' }}
                                    />
                                    <Button
                                        icon={<Gavel size={18} />}
                                        rounded
                                        severity="success"
                                        aria-label="Ver lances"
                                        tooltip="Ver lances"
                                        tooltipOptions={{ position: 'top' }}
                                        style={{ width: '40px', height: '40px' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Template para exibição em grid
    const gridItem = (auction) => {
        const getStatusBadge = (status) => {
            const statusConfig = {
                EM_ANALISE: { label: 'Em Análise', color: '#f59e0b', bgColor: '#fef3c7' },
                ATIVO: { label: 'Ativo', color: '#10b981', bgColor: '#d1fae5' },
                FINALIZADO: { label: 'Finalizado', color: '#6b7280', bgColor: '#f3f4f6' },
                CANCELADO: { label: 'Cancelado', color: '#ef4444', bgColor: '#fee2e2' }
            };
            const config = statusConfig[status] || statusConfig.EM_ANALISE;
            return (
                <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: config.color,
                    backgroundColor: config.bgColor
                }}>
                    {config.label}
                </span>
            );
        };

        return (
            <div className="col-12 sm:col-6 lg:col-12 xl:col-4 p-2" key={auction.idAuction}>
                <div className="p-4 border-1 surface-border surface-card border-round">
                    <div className="flex flex-column align-items-center gap-3 py-5">
                        <img
                            className="w-9 shadow-2 border-round"
                            src={auction.images && auction.images.length > 0 ? auction.images[0] : 'https://via.placeholder.com/300x200'}
                            alt={auction.title}
                            style={{ objectFit: 'cover', height: '200px', width: '100%' }}
                        />
                        <div className="text-2xl font-bold text-center">{auction.title}</div>
                        <div className="text-center text-600">{auction.description}</div>
                        {auction.category && (
                            <span style={{
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                color: '#6366f1',
                                backgroundColor: '#e0e7ff'
                            }}>
                                {auction.category.name}
                            </span>
                        )}
                        {getStatusBadge(auction.status)}
                    </div>
                    <div className="flex flex-column gap-2">
                        <div className="flex align-items-center justify-content-between">
                            <span className="text-600">Lance Mínimo:</span>
                            <span className="text-xl font-semibold text-900">
                                {parseFloat(auction.minimumBid || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                        {auction.currentBid && (
                            <div className="flex align-items-center justify-content-between">
                                <span className="text-600">Lance Atual:</span>
                                <span className="text-lg font-semibold text-blue-600">
                                    {parseFloat(auction.currentBid).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>
                        )}
                        {auction.totalBids > 0 && (
                            <div className="text-center text-sm text-600 mt-2">
                                {auction.totalBids} lance(s)
                            </div>
                        )}
                        <div className="flex gap-2 justify-content-center mt-3">
                            <Button icon="pi pi-pencil" rounded severity="warning" onClick={() => openModalForEdit(auction)} />
                            <Button icon="pi pi-trash" rounded severity="danger" onClick={() => handleDelete(auction)} />
                            <Button icon={<Gavel size={20} />} rounded severity="success" />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Template item (escolhe entre list ou grid)
    const itemTemplate = (auction, layout, index) => {
        if (!auction) return null;
        if (layout === 'list') return listItem(auction, index);
        else if (layout === 'grid') return gridItem(auction);
    };

    // Template da lista completa
    const listTemplate = (auctions, layout) => {
        return <div className="grid grid-nogutter w-full">{auctions?.map((auction, index) => itemTemplate(auction, layout, index))}</div>;
    };

    if (isLoading) {
        return <GenericLoader />;
    }

    return (
        <div className="auctions-container">
            {console.log(auctions)
            }
            <section className="page-header">
                <div>
                    <h1 className="page-title">Gerenciamento de Leilões</h1>
                    <p className="page-subtitle">Gerencie todos os leilões do sistema</p>
                </div>
            </section>

            <section className="content-section">
                <div className="search-and-include">
                    <div className="search-box">
                        <InputText
                            type="text"
                            placeholder="Pesquisar leilões por título ou descrição..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    setDebouncedSearch(searchTerm);
                                }
                            }}
                            className="search-input"
                        />
                        <Button
                            icon={isLoading && debouncedSearch ? "pi pi-spin pi-spinner" : <Search size={20} />}
                            className="search-button-auction"
                            onClick={() => setDebouncedSearch(searchTerm)}
                            tooltip="Buscar"
                            tooltipOptions={{ position: 'top' }}
                        />
                        {searchTerm && (
                            <Button
                                icon="pi pi-times"
                                className="clear-button"
                                onClick={clearSearch}
                                tooltip="Limpar"
                                tooltipOptions={{ position: 'top' }}
                            />
                        )}
                    </div>
                    <Button
                        label="Novo Leilão"
                        icon={<Plus size={20} />}
                        className="add-button"
                        onClick={openModalForCreate}
                    />
                </div>

                <div className="card espacing-table" style={{ width: '100%' }}>
                    {auctions && auctions.length === 0 ? (
                        <div className="no-data">
                            {debouncedSearch ? (
                                <>
                                    <Search size={48} />
                                    <p>Nenhum leilão encontrado para "{debouncedSearch}"</p>
                                    <Button label="Limpar busca" onClick={clearSearch} />
                                </>
                            ) : (
                                <>
                                    <Gavel size={48} />
                                    <p>Nenhum leilão cadastrado</p>
                                    <Button label="Cadastrar Leilão" onClick={openModalForCreate} />
                                </>
                            )}
                        </div>
                    ) : (
                        <DataView
                            value={auctions}
                            listTemplate={listTemplate}
                            layout={layout}
                            paginator={false}
                            rows={5}
                            rowsPerPageOptions={[5, 10, 20]}
                            paginatorPosition="top"
                            paginatorClassName="paginator-mod"
                            paginatorTemplate={{
                                layout: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown',
                                RowsPerPageDropdown: (options) => (
                                    <div className="flex align-items-center" style={{ width: "45%" }}>
                                        <span className="mr-2" style={{ fontWeight: 'bold' }}>Itens por página:</span>
                                        {options.element}
                                    </div>
                                )
                            }}
                        />
                    )}
                </div>
            </section>

            {/* Modal */}
            <Dialog
                header={
                    <div className="modal-header-custom">
                        <i className={`pi ${editingAuction ? 'pi-pencil' : 'pi-plus'}`} />
                        <span>{editingAuction ? 'Editar Leilão' : 'Novo Leilão'}</span>
                    </div>
                }
                visible={showModal}
                style={{ width: '750px', maxHeight: '90vh' }}
                modal
                onHide={closeModal}
                draggable={false}
                resizable={false}
            >
                <div className="form-grid-two">
                    <div className="form-field full-width">
                        <label>Título do Leilão *</label>
                        <InputText
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            placeholder="Ex: Fiat Uno 2015"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-field full-width">
                        <label>Descrição Breve *</label>
                        <InputTextarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Descrição resumida do leilão"
                            rows={2}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-field full-width">
                        <label>Descrição Detalhada</label>
                        <InputTextarea
                            value={formData.detailedDescription}
                            onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
                            placeholder="Informações detalhadas sobre o item do leilão"
                            rows={3}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-field">
                        <label>Lance Mínimo (R$) *</label>
                        <InputText
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.minimumBid}
                            onChange={(e) => handleInputChange('minimumBid', e.target.value)}
                            placeholder="1000.00"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-field">
                        <label>Incremento (R$) *</label>
                        <InputText
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.valueIncrement}
                            onChange={(e) => handleInputChange('valueIncrement', e.target.value)}
                            placeholder="100.00"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-field">
                        <label>Data/Hora de Início *</label>
                        <PrimeCalendar
                            value={formData.startTime}
                            onChange={(e) => handleInputChange('startTime', e.value)}
                            dateFormat="dd/mm/yy"
                            showTime
                            hourFormat="24"
                            showIcon
                            appendTo="self"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-field">
                        <label>Data/Hora de Término *</label>
                        <PrimeCalendar
                            value={formData.endTime}
                            onChange={(e) => handleInputChange('endTime', e.value)}
                            dateFormat="dd/mm/yy"
                            showTime
                            hourFormat="24"
                            showIcon
                            appendTo="self"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-field">
                        <label>Categoria *</label>
                        <Dropdown
                            value={formData.categoryId}
                            options={categories}
                            onChange={(e) => {
                                console.log(e);
                                handleInputChange('categoryId', e.value)
                            }}
                            optionLabel="name"
                            optionValue="id_category"
                            placeholder="Selecione a categoria"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-field full-width">
                        <label>Observações</label>
                        <InputTextarea
                            value={formData.observation}
                            onChange={(e) => handleInputChange('observation', e.target.value)}
                            placeholder="Observações adicionais sobre o leilão"
                            rows={2}
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Upload de Imagens */}
                    <div className="form-field full-width">
                        <label>Imagens do Leilão (máximo 10)</label>
                        <div className="image-upload-container">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelect}
                                style={{ display: 'none' }}
                                disabled={isSubmitting}
                            />
                            <Button
                                label="Selecionar Imagens"
                                icon={<Upload size={18} />}
                                severity="info"
                                outlined
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isSubmitting || imagePreviewUrls.length >= 10}
                            />
                            <span className="image-count">
                                {imagePreviewUrls.length} / 10 imagens
                            </span>
                        </div>

                        {/* Preview das Imagens */}
                        {imagePreviewUrls.length > 0 && (
                            <div className="image-preview-grid">
                                {imagePreviewUrls.map((url, index) => (
                                    <div key={index} className="image-preview-item">
                                        <img src={url} alt={`Preview ${index + 1}`} />
                                        <button
                                            type="button"
                                            className="remove-image-btn"
                                            onClick={() => handleRemoveImage(index)}
                                            disabled={isSubmitting}
                                            title="Remover imagem"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <Divider />

                <div className="modal-footer">
                    <Button
                        label="Limpar"
                        icon="pi pi-refresh"
                        severity="secondary"
                        outlined
                        onClick={clearFields}
                        disabled={isSubmitting}
                    />
                    <Button
                        label="Cancelar"
                        icon="pi pi-times"
                        severity="secondary"
                        outlined
                        onClick={closeModal}
                        disabled={isSubmitting}
                    />
                    <Button
                        label={editingAuction ? 'Atualizar' : 'Cadastrar'}
                        icon={isSubmitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                        severity={editingAuction ? 'warning' : 'success'}
                        onClick={handleSubmit}
                        loading={isSubmitting}
                    />
                </div>
            </Dialog>
        </div>
    );
}

export default Auctions;
