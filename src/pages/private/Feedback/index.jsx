import { Plus, Star, StarFour } from '@phosphor-icons/react';
import { Search } from 'lucide-react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Divider } from 'primereact/divider';
import GenericLoader from '../../../components/GenericLoader/GenericLoader';
import Api from '../../../api/api';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useQueryClient } from '@tanstack/react-query';
import { useAllFeedback } from '../../../hooks/useFeedback';
import { useAllUsers } from '../../../hooks/useUsers';
import { useState, useEffect } from 'react';
import './styles.css';
import { useAuth } from '../../../hooks/useAuth';

function Feedback() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const { feedback, isLoading } = useAllFeedback(debouncedSearch || null);
    const { users, isLoading: isLoadingUsers } = useAllUsers();
    const { user, logout } = useAuth();

    const queryClient = useQueryClient();

    const [showModal, setShowModal] = useState(false);
    const [editingFeedback, setEditingFeedback] = useState(null);
    const [comment, setComment] = useState('');
    const [note, setNote] = useState(0);
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);


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
        setEditingFeedback(null);
        setComment('');
        setNote(0);
        setSelectedRecipient(null);
        setShowModal(true);
    };

    const openModalForEdit = (feedbackItem) => {
        setEditingFeedback(feedbackItem);
        setComment(feedbackItem.comment);
        setNote(feedbackItem.note);
        setSelectedRecipient(feedbackItem.recipient);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingFeedback(null);
        setComment('');
        setNote(0);
        setSelectedRecipient(null);
        setIsSubmitting(false);
    };

    const clearFields = () => {
        setComment('');
        setNote(0);
        setSelectedRecipient(null);
    };

    const handleSubmit = async () => {
        if (!comment.trim()) {
            toast.error('Por favor, informe o comentário');
            return;
        }

        if (!selectedRecipient) {
            toast.error('Por favor, selecione o destinatário');
            return;
        }

        if (note === 0) {
            toast.error('Por favor, selecione uma nota de 1 a 5 estrelas');
            return;
        }

        setIsSubmitting(true);

        try {
            let response;
            if (editingFeedback) {

                response = await Api.put(`/feedbacks/${editingFeedback.id_feedback}`, {
                    comment: comment.trim(),
                    note: note,
                    author: { id_user: user.id },
                    recipient: { id_user: selectedRecipient.id }
                });

                if (response.status === 200) {
                    await queryClient.invalidateQueries(['all_feedback']);
                    toast.success('Feedback atualizado com sucesso!');
                    closeModal();
                } else {
                    toast.error('Erro ao atualizar feedback. Tente novamente.');
                }
            } else {
                response = await Api.post('/feedbacks', {
                    comment: comment.trim(),
                    note: note,
                    author: { id_user: user.id },
                    recipient: { id_user: selectedRecipient.id }
                });

                if (response.status === 200) {
                    await queryClient.invalidateQueries(['all_feedback']);
                    toast.success('Feedback criado com sucesso!');
                    closeModal();
                } else {
                    toast.error('Erro ao criar feedback. Tente novamente.');
                }
            }
        } catch (error) {
            const errorMessage = editingFeedback
                ? 'Erro ao atualizar feedback. Tente novamente.'
                : 'Erro ao criar feedback. Tente novamente.';
            toast.error(`${errorMessage} ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const dtCadBodyTemplate = (rowData) => {
        return (
            rowData.dt_create ? new Date(rowData.dt_create).toLocaleDateString('pt-BR') : 'N/A'
        );
    };

    const rowClassName = (data, index) => {
        return index % 2 === 0 ? 'even-row' : 'odd-row';
    };

    const noteBodyTemplate = (rowData) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <i
                    key={i}
                    className={`pi pi-star${i <= rowData.note ? '-fill' : ''} star ${i <= rowData.note ? '' : 'empty'}`}
                    style={{
                        color: i <= rowData.note ? '#fbbf24' : '#d1d5db',
                        fontSize: '1rem'
                    }}
                />
            );
        }
        return <div className="table-stars">{stars}</div>;
    };

    const authorBodyTemplate = (rowData) => {
        return rowData.author ? rowData.author.name : 'N/A';
    };

    const recipientBodyTemplate = (rowData) => {
        return rowData.recipient ? rowData.recipient.name : 'N/A';
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="btn-action">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    text
                    severity="warning"
                    aria-label="Edit"
                    onClick={() => openModalForEdit(rowData)}
                    tooltip="Editar feedback"
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon='pi pi-trash'
                    rounded text severity="danger" aria-label="Cancel"
                    tooltip="Excluir feedback"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => {
                        Swal.fire({
                            title: 'Excluir Feedback',
                            text: `Tem certeza que deseja excluir este feedback?`,
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Sim, excluir!',
                            reverseButtons: true,
                            focusCancel: true,
                            focusConfirm: false,
                            customClass: {
                                popup: 'sweet-alert-zindex'
                            },
                            cancelButtonText: 'Cancelar'
                        }).then(async (result) => {
                            if (result.isConfirmed) {
                                try {
                                    const response = await Api.delete(`/feedbacks/${rowData.id_feedback}`);
                                    if (response.status === 204) {
                                        await queryClient.invalidateQueries(['all_feedback']);
                                        toast.success(`Feedback excluído com sucesso!`);
                                        return
                                    } else {
                                        toast.error(`Erro ao excluir feedback. Tente novamente. ${response.error}`);
                                        return
                                    }
                                } catch (error) {
                                    toast.error(`Erro ao excluir feedback. Tente novamente. ${error.message}`);
                                    return
                                }
                            }
                        })
                    }}
                />
            </div>
        );
    };

    const StarRating = ({ value, onChange }) => {
        const [hoveredStar, setHoveredStar] = useState(0);

        const handleStarClick = (starValue) => {
            onChange(starValue);
        };

        const handleStarHover = (starValue) => {
            setHoveredStar(starValue);
        };

        const handleStarLeave = () => {
            setHoveredStar(0);
        };

        return (
            <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                    <i
                        key={star}
                        className={`pi pi-star${(hoveredStar >= star || value >= star) ? '-fill' : ''} star ${(hoveredStar >= star || value >= star) ? 'filled' : ''}`}
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => handleStarHover(star)}
                        onMouseLeave={handleStarLeave}
                    />
                ))}
                <span style={{ marginLeft: '8px', color: '#6b7280', fontSize: '0.9rem' }}>
                    {value > 0 ? `${value} de 5 estrelas` : 'Clique para avaliar'}
                </span>
            </div>
        );
    };

    return (
        isLoading ? (
            <GenericLoader />
        ) : (
            <div className="feedback-container">
                <section className="page-header">
                    <div>
                        <h1 className="page-title">Gerenciamento de Feedbacks</h1>
                        <p className="page-subtitle">Gerencie todos os feedbacks do sistema</p>
                    </div>
                </section>
                <div className="content-section">
                    <section className="content-list">
                        <div className="search-and-include">
                            <div className="search-feedback" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <InputText
                                    type="text"
                                    placeholder="Pesquisar feedback..."
                                    style={{
                                        borderTopRightRadius: 0,
                                        borderBottomRightRadius: 0,
                                        width: '80%',
                                        height: '40px'
                                    }}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    value={searchTerm}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            setDebouncedSearch(searchTerm);
                                        }
                                    }}
                                />
                                <Button
                                    icon={isLoading && debouncedSearch ? "pi pi-spin pi-spinner" : <Search size={22} color='white' />}
                                    iconPos='left'
                                    className="button-search"
                                    onClick={() => setDebouncedSearch(searchTerm)}
                                    tooltip="Buscar feedback"
                                    tooltipOptions={{ position: 'top' }}
                                    loading={isLoading && debouncedSearch}
                                />
                                {searchTerm && (
                                    <Button
                                        icon="pi pi-times"
                                        className="p-button-text p-button-plain"
                                        onClick={clearSearch}
                                        tooltip="Limpar busca"
                                        tooltipOptions={{ position: 'top' }}
                                        style={{
                                            marginLeft: '8px',
                                            color: '#6b7280'
                                        }}
                                    />
                                )}
                                {debouncedSearch && (
                                    <small style={{
                                        position: 'absolute',
                                        bottom: '-20px',
                                        left: '0',
                                        color: '#6b7280',
                                        fontSize: '0.8rem'
                                    }}>
                                        Buscando por: "{debouncedSearch}"
                                    </small>
                                )}
                            </div>
                            <div className="include">
                                <Button
                                    label="Cadastrar Feedback"
                                    icon={<Plus size={20} weight='bold' />}
                                    className="button-include"
                                    onClick={openModalForCreate}
                                />
                            </div>
                        </div>
                        <div className="card espacing-table" style={{ width: '100%' }}>
                            {feedback && feedback.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '2rem',
                                    color: '#6b7280',
                                    fontSize: '1.1rem'
                                }}>
                                    {debouncedSearch ? (
                                        <>
                                            <i className="pi pi-search" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
                                            <p>Nenhum feedback encontrado para "<strong>{debouncedSearch}</strong>"</p>
                                            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                                Tente buscar com outros termos ou
                                                <Button
                                                    label="limpar a busca"
                                                    className="p-button-link"
                                                    onClick={clearSearch}
                                                    style={{ padding: '0 0.5rem' }}
                                                />
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <i className="pi pi-star" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
                                            <p>Nenhum feedback cadastrado ainda.</p>
                                            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                                Clique em "Cadastrar Feedback" para começar.
                                            </p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <DataTable value={feedback} size='large' tableStyle={{ width: '100%' }} rowClassName={rowClassName} paginator rows={20} responsiveLayout="scroll" showGridlines stripedRows >
                                    <Column field="id_feedback" headerClassName='header-table' sortable header="Código" headerStyle={{ borderTopLeftRadius: '5px' }} align={'center'} ></Column>
                                    <Column header="Autor" headerClassName='header-table' sortable body={authorBodyTemplate} align={'center'} ></Column>
                                    <Column header="Destinatário" headerClassName='header-table' sortable body={recipientBodyTemplate} align={'center'} ></Column>
                                    <Column header="Comentário" headerClassName='header-table' sortable field='comment' align={'center'} style={{ maxWidth: '300px' }}></Column>
                                    <Column header="Nota" headerClassName='header-table' body={noteBodyTemplate} align={'center'} ></Column>
                                    <Column field="dt_created" headerClassName='header-table' header="Data de Cadastro" body={dtCadBodyTemplate} align={'center'} ></Column>
                                    <Column header="Ações" headerClassName='header-table' body={actionBodyTemplate} headerStyle={{ borderTopRightRadius: '5px' }} align={'center'} ></Column>
                                </DataTable>
                            )}
                        </div>
                    </section>

                    <Dialog
                        header={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 2000 }}>
                                <i className={`pi ${editingFeedback ? 'pi-pencil' : 'pi-plus'}`}
                                    style={{
                                        color: '#ffffff',
                                        fontSize: '1.2rem'
                                    }}
                                />
                                <span style={{
                                    fontSize: '1.3rem',
                                    fontWeight: '600',
                                    color: '#ffffff'
                                }}>
                                    {editingFeedback ? 'Editar Feedback' : 'Novo Feedback'}
                                </span>
                            </div>
                        }
                        visible={showModal}
                        style={{
                            width: '600px',
                            zIndex: 10000
                        }}
                        modal
                        onHide={closeModal}
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
                                    htmlFor="recipient"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '1rem',
                                        fontWeight: '500',
                                        color: '#374151'
                                    }}
                                >
                                    Destinatário *
                                </label>
                                <select
                                    id="recipient"
                                    value={selectedRecipient ? selectedRecipient.id_user : ''}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            const selected = users.find(u => u.name === e.target.value);
                                            setSelectedRecipient(selected || null);
                                        } else {
                                            setSelectedRecipient(null);
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        fontSize: '1rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                        cursor: 'pointer',
                                        transition: 'border-color 0.3s ease',
                                        outline: 'none'
                                    }}
                                    className="feedback-input"
                                    disabled={isLoadingUsers}
                                    onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                >
                                    <option value="">Selecione o destinatário</option>
                                    {users && users
                                        .filter(u => u.id_user !== user.id)
                                        .map(u => (
                                            <option key={u.id_user} value={u.id_user}>
                                                {u.name}
                                            </option>
                                        ))
                                    }
                                </select>
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
                                    placeholder="Digite seu comentário sobre o usuário..."
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
                                    label="Limpar"
                                    icon="pi pi-refresh"
                                    severity="secondary"
                                    outlined
                                    onClick={clearFields}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        fontWeight: '500'
                                    }}
                                    disabled={isSubmitting}
                                />
                                <Button
                                    label="Cancelar"
                                    icon="pi pi-times"
                                    severity="secondary"
                                    outlined
                                    onClick={closeModal}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        fontWeight: '500'
                                    }}
                                    disabled={isSubmitting}
                                />
                                <Button
                                    label={editingFeedback ? "Atualizar" : "Confirmar"}
                                    icon={isSubmitting ? "pi pi-spin pi-spinner" : (editingFeedback ? "pi pi-check" : "pi pi-plus")}
                                    severity="warning"
                                    onClick={handleSubmit}
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
                </div>
            </div>
        )
    );
}

export default Feedback;
