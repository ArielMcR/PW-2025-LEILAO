import { Plus } from '@phosphor-icons/react';
import { Search } from 'lucide-react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Divider } from 'primereact/divider';
import GenericLoader from '../../../components/GenericLoader/GenericLoader';
import Api from '../../../api/api';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useQueryClient } from '@tanstack/react-query';
import { useAllCategories } from '../../../hooks/useCategories';
import Header from '../../../components/Header/Header';
import { useState, useEffect } from 'react';
import './styles.css';
import { useAuth } from '../../../hooks/useAuth';

function Categories() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const { categories, isLoading } = useAllCategories(debouncedSearch || null);
    const { user } = useAuth()

    const queryClient = useQueryClient();

    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const clearSearch = () => {
        setSearchTerm('');
        setDebouncedSearch('');
    };

    const openModalForCreate = () => {
        setEditingCategory(null);
        setCategoryName('');
        setCategoryDescription('');
        setShowModal(true);
    };

    const openModalForEdit = (category) => {
        setEditingCategory(category);
        setCategoryName(category.name);
        setCategoryDescription(category.description);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setCategoryName('');
        setCategoryDescription('');
        setIsSubmitting(false);
    };

    const clearFields = () => {
        setCategoryName('');
        setCategoryDescription('');
    };

    const handleSubmit = async () => {
        if (!categoryName.trim()) {
            toast.error('Por favor, informe o nome da categoria');
            return;
        }

        setIsSubmitting(true);

        try {
            let response;
            if (editingCategory) {
                response = await Api.put(`/categories`, {
                    id_category: editingCategory.id_category,
                    id_user: user.id,
                    name: categoryName.trim(),
                    observation: categoryDescription.trim()
                });

                if (response.status === 200) {
                    await queryClient.invalidateQueries(['all_categories']);
                    toast.success('Categoria atualizada com sucesso!');
                    closeModal();
                } else {
                    toast.error('Erro ao atualizar categoria. Tente novamente.');
                }
            } else {
                response = await Api.post('/categories', {
                    user: {
                        id_user: user.id,
                    },
                    name: categoryName.trim(),
                    observation: categoryDescription.trim()
                });

                if (response.status === 200) {
                    await queryClient.invalidateQueries(['all_categories']);
                    toast.success('Categoria criada com sucesso!');
                    closeModal();
                } else {
                    toast.error('Erro ao criar categoria. Tente novamente.');
                }
            }
        } catch (error) {
            const errorMessage = editingCategory
                ? 'Erro ao atualizar categoria. Tente novamente.'
                : 'Erro ao criar categoria. Tente novamente.';
            toast.error(`${errorMessage} ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    const rowClassName = (data, index) => {
        return index % 2 === 0 ? 'even-row' : 'odd-row';
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
                    tooltip="Editar categoria"
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon='pi pi-trash'
                    rounded text severity="danger" aria-label="Cancel"
                    tooltip="Excluir categoria"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => {
                        Swal.fire({
                            title: 'Excluir Categoria',
                            text: `Tem certeza que deseja excluir a Categoria ${rowData.name}?`,
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
                                    const response = await Api.delete(`/categories/${rowData.id_category}`);
                                    if (response.status === 200) {
                                        await queryClient.invalidateQueries(['all_categories']);
                                        toast.success(`Categoria ${rowData.name} excluída com sucesso!`);
                                        return
                                    } else {
                                        toast.error(`Erro ao excluir categoria. Tente novamente. ${response.error}`);
                                        return
                                    }
                                } catch (error) {
                                    toast.error(`Erro ao excluir categoria. Tente novamente. ${error.message}`);
                                    return
                                }
                            }
                        })
                    }
                    }
                />
            </div>
        );
    }


    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);
    return (
        isLoading ? (
            <GenericLoader />
        ) : (
            <>
                <Header />
                <main style={{ position: 'relative', padding: '20px', zIndex: 1 }} className='w-full'>
                    <section className="header-list w-full">
                        <h3 className="text-header"> 001 - Listagem de Categorias</h3>
                        <br />
                    </section>
                    <section className="title-page">
                        <div style={{ padding: '20px' }}> <h1 className='title'> Listagem de Categorias</h1></div>
                    </section>
                    <section className="content-list">
                        <div className="search-and-include">
                            <div className="search-categories" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <InputText
                                    type="text"
                                    placeholder="Pesquisar categorias..."
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
                                    tooltip="Buscar categorias"
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
                                    label="Cadastrar Categoria"
                                    icon={<Plus size={20} weight='bold' />}
                                    className="button-include"
                                    onClick={openModalForCreate}
                                />
                            </div>
                        </div>
                        <div className="card espacing-table" style={{ width: '100%' }}>
                            {categories && categories.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '2rem',
                                    color: '#6b7280',
                                    fontSize: '1.1rem'
                                }}>
                                    {debouncedSearch ? (
                                        <>
                                            <i className="pi pi-search" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
                                            <p>Nenhuma categoria encontrada para "<strong>{debouncedSearch}</strong>"</p>
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
                                            <i className="pi pi-inbox" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}></i>
                                            <p>Nenhuma categoria cadastrada ainda.</p>
                                            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                                Clique em "Cadastrar Categoria" para começar.
                                            </p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <DataTable value={categories} size='large' tableStyle={{ width: '100%' }} rowClassName={rowClassName} paginator rows={20} responsiveLayout="scroll" showGridlines stripedRows >
                                    <Column field="id_category" headerClassName='header-table' sortable header="Código" headerStyle={{ borderTopLeftRadius: '5px' }} align={'center'} ></Column>
                                    <Column header="Nome da Categoria" headerClassName='header-table' sortable field='name' align={'center'} ></Column>
                                    <Column header="Observação" headerClassName='header-table' sortable field='observation' align={'center'} ></Column>
                                    <Column header="Ações" headerClassName='header-table' body={actionBodyTemplate} headerStyle={{ borderTopRightRadius: '5px' }} align={'center'} ></Column>
                                </DataTable>
                            )}
                        </div>
                    </section>


                    <Dialog
                        header={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 2000 }}>
                                <i className={`pi ${editingCategory ? 'pi-pencil' : 'pi-plus'}`}
                                    style={{
                                        color: editingCategory ? '#f59e0b' : '#10b981',
                                        fontSize: '1.2rem'
                                    }}
                                />
                                <span style={{
                                    fontSize: '1.3rem',
                                    fontWeight: '600',
                                    color: '#e0e0e0ff'
                                }}>
                                    {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                                </span>
                            </div>
                        }
                        visible={showModal}
                        style={{
                            width: '450px',
                            zIndex: 10000
                        }}
                        modal
                        onHide={closeModal}
                        className="category-modal"
                        maskClassName="category-modal"
                        appendTo={document.body}
                        baseZIndex={9999}
                        headerStyle={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                                    htmlFor="categoryName"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '1rem',
                                        fontWeight: '500',
                                        color: '#374151'
                                    }}
                                >
                                    Nome da Categoria *
                                </label>
                                <InputText
                                    id="categoryName"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    placeholder="Digite o nome da categoria"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        fontSize: '1rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        transition: 'all 0.3s ease',
                                        backgroundColor: 'white'
                                    }}
                                    className="category-input"
                                    autoFocus
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSubmit();
                                        }
                                    }}
                                />
                                <label
                                    htmlFor="categoryName"
                                    style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '1rem',
                                        fontWeight: '500',
                                        color: '#374151'
                                    }}
                                >
                                    Observação *
                                </label>
                                <InputText
                                    id="categoryDescription"
                                    value={categoryDescription}
                                    onChange={(e) => setCategoryDescription(e.target.value)}
                                    placeholder="Digite a descrição da categoria"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        fontSize: '1rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        transition: 'all 0.3s ease',
                                        backgroundColor: 'white'
                                    }}
                                    className="category-input"
                                    autoFocus
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSubmit();
                                        }
                                    }}
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
                                    label={editingCategory ? "Atualizar" : "Confirmar"}
                                    icon={isSubmitting ? "pi pi-spin pi-spinner" : (editingCategory ? "pi pi-check" : "pi pi-plus")}
                                    severity={editingCategory ? "warning" : "success"}
                                    onClick={handleSubmit}
                                    loading={isSubmitting}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        fontWeight: '500',
                                        background: editingCategory
                                            ? 'linear-gradient(45deg, #f59e0b, #d97706)'
                                            : 'linear-gradient(45deg, #10b981, #059669)',
                                        border: 'none',
                                        color: 'white'
                                    }}
                                />
                            </div>
                        </div>
                    </Dialog>
                </main >
            </>

        )
    );
}

export default Categories;

