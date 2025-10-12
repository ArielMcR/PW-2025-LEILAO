import React, { useState, useEffect } from 'react';
import { Plus, Search, Shield, User, Mail, Phone, Calendar } from 'lucide-react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Divider } from 'primereact/divider';
import GenericLoader from '../../../components/GenericLoader/GenericLoader';
import Api from '../../../api/api';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useQueryClient } from '@tanstack/react-query';
import { useAllUsers } from '../../../hooks/useUsers';
import './styles.css';

function Users() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const { users, isLoading } = useAllUsers(debouncedSearch || null);
    const queryClient = useQueryClient();

    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        cpf: '',
        phone: '',
        role: 'ROLE_USER',
        password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const roleOptions = [
        { label: 'Usuário', value: 'ROLE_USER' },
        { label: 'Administrador', value: 'ROLE_ADMIN' },
        { label: 'Administrador', value: 'ROLE_ADMIN' }
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
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            cpf: '',
            phone: '',
            role: 'ROLE_USER',
            password: ''
        });
        setShowModal(true);
    };

    const openModalForEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            cpf: user.cpf || '',
            phone: user.phone || '',
            role: user.role || 'ROLE_USER',
            password: ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            cpf: '',
            phone: '',
            role: 'ROLE_USER',
            password: ''
        });
        setIsSubmitting(false);
    };

    const clearFields = () => {
        setFormData({
            name: '',
            email: '',
            cpf: '',
            phone: '',
            role: 'ROLE_USER',
            password: ''
        });
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        // Validações
        if (!formData.name.trim()) {
            toast.error('Por favor, informe o nome');
            return;
        }

        if (!formData.email.trim()) {
            toast.error('Por favor, informe o e-mail');
            return;
        }

        if (!editingUser && !formData.password.trim()) {
            toast.error('Por favor, informe a senha');
            return;
        }

        setIsSubmitting(true);

        try {
            let response;
            if (editingUser) {
                const updateData = {
                    id_user: editingUser.id_user,
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    cpf: formData.cpf.trim(),
                    phone: formData.phone.trim(),
                    role: formData.role
                };

                if (formData.password.trim()) {
                    updateData.password = formData.password;
                }

                response = await Api.put(`/users/${editingUser.id_user}`, updateData);

                if (response.status === 200) {
                    await queryClient.invalidateQueries(['all_users']);
                    toast.success('Usuário atualizado com sucesso!');
                    closeModal();
                } else {
                    toast.error('Erro ao atualizar usuário. Tente novamente.');
                }
            } else {
                response = await Api.post('/auth/register', {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    cpf: formData.cpf.trim(),
                    phone: formData.phone.trim(),
                    role: formData.role,
                    password: formData.password
                });

                if (response.status === 200 || response.status === 201) {
                    await queryClient.invalidateQueries(['all_users']);
                    toast.success('Usuário criado com sucesso!');
                    closeModal();
                } else {
                    toast.error('Erro ao criar usuário. Tente novamente.');
                }
            }
        } catch (error) {
            const errorMessage = editingUser
                ? 'Erro ao atualizar usuário. Tente novamente.'
                : 'Erro ao criar usuário. Tente novamente.';
            toast.error(`${errorMessage} ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const rowClassName = (data, index) => {
        return index % 2 === 0 ? 'even-row' : 'odd-row';
    };

    const roleBodyTemplate = (rowData) => {
        const isAdmin = rowData.userRole === 'ROLE_ADMIN';
        return (
            <div className={`role-badge ${isAdmin ? 'admin' : 'user'}`}>
                {isAdmin ? <Shield size={14} /> : <User size={14} />}
                <span>{isAdmin ? 'Administrador' : 'Usuário'}</span>
            </div>
        );
    };

    const emailBodyTemplate = (rowData) => {
        return (
            <div className="email-cell">
                <Mail size={14} />
                <span>{rowData.email || 'N/A'}</span>
            </div>
        );
    };

    const phoneBodyTemplate = (rowData) => {
        return (
            <div className="phone-cell">
                <Phone size={14} />
                <span>{rowData.cellphone || 'N/A'}</span>
            </div>
        );
    };

    const dateBodyTemplate = (rowData) => {
        return rowData.createdAt
            ? new Date(rowData.createdAt).toLocaleDateString('pt-BR')
            : 'N/A';
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
                    tooltip="Editar usuário"
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    text
                    severity="danger"
                    aria-label="Delete"
                    tooltip="Excluir usuário"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => {
                        Swal.fire({
                            title: 'Excluir Usuário',
                            text: `Tem certeza que deseja excluir o usuário ${rowData.name}?`,
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
                                    const response = await Api.delete(`/users/${rowData.id_user}`);
                                    if (response.status === 200 || response.status === 204) {
                                        await queryClient.invalidateQueries(['all_users']);
                                        toast.success(`Usuário ${rowData.name} excluído com sucesso!`);
                                    } else {
                                        toast.error('Erro ao excluir usuário. Tente novamente.');
                                    }
                                } catch (error) {
                                    toast.error(`Erro ao excluir usuário. Tente novamente. ${error.message}`);
                                }
                            }
                        });
                    }}
                />
            </div>
        );
    };

    if (isLoading) {
        return <GenericLoader />;
    }

    return (
        <div className="users-container">
            <section className="page-header">
                <div>
                    <h1 className="page-title">Gerenciamento de Usuários</h1>
                    <p className="page-subtitle">Gerencie todos os usuários do sistema</p>
                </div>
            </section>

            <section className="content-section">
                <div className="search-and-include">
                    <div className="search-box">
                        <InputText
                            type="text"
                            placeholder="Pesquisar usuários por nome, email ou CPF..."
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
                            className="search-button"
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
                        label="Novo Usuário"
                        icon={<Plus size={20} />}
                        className="add-button"
                        onClick={openModalForCreate}
                    />
                </div>

                <div className="table-container">
                    {users && users.length === 0 ? (
                        <div className="no-data">
                            {debouncedSearch ? (
                                <>
                                    <Search size={48} />
                                    <p>Nenhum usuário encontrado para "{debouncedSearch}"</p>
                                    <Button label="Limpar busca" onClick={clearSearch} />
                                </>
                            ) : (
                                <>
                                    <Users size={48} />
                                    <p>Nenhum usuário cadastrado</p>
                                    <Button label="Cadastrar Usuário" onClick={openModalForCreate} />
                                </>
                            )}
                        </div>
                    ) : (
                        <DataTable
                            value={users}
                            size="large"
                            rowClassName={rowClassName}
                            paginator
                            rows={10}
                            responsiveLayout="scroll"
                            showGridlines
                            stripedRows
                        >
                            <Column field="id" header="ID" sortable align="center" />
                            <Column field="name" header="Nome" sortable align="center" />
                            <Column header="E-mail" body={emailBodyTemplate} sortable align="center" />
                            <Column field="cpf" header="CPF" sortable align="center" />
                            <Column header="Telefone" body={phoneBodyTemplate} align="center" />
                            <Column header="Tipo" body={roleBodyTemplate} sortable align="center" />
                            <Column header="Data Cadastro" body={dateBodyTemplate} sortable align="center" />
                            <Column header="Ações" body={actionBodyTemplate} align="center" />
                        </DataTable>
                    )}
                </div>
            </section>

            {/* Modal */}
            <Dialog
                header={
                    <div className="modal-header-custom">
                        <i className={`pi ${editingUser ? 'pi-pencil' : 'pi-plus'}`} />
                        <span>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</span>
                    </div>
                }
                visible={showModal}
                style={{ width: '550px' }}
                modal
                onHide={closeModal}
                draggable={false}
                resizable={false}
            >
                <div className="form-grid">
                    <div className="form-field">
                        <label>Nome Completo *</label>
                        <InputText
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Digite o nome completo"
                        />
                    </div>

                    <div className="form-field">
                        <label>E-mail *</label>
                        <InputText
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Digite o e-mail"
                        />
                    </div>

                    <div className="form-field">
                        <label>CPF</label>
                        <InputText
                            value={formData.cpf}
                            onChange={(e) => handleInputChange('cpf', e.target.value)}
                            placeholder="Digite o CPF"
                        />
                    </div>

                    <div className="form-field">
                        <label>Telefone</label>
                        <InputText
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="Digite o telefone"
                        />
                    </div>

                    <div className="form-field">
                        <label>Tipo de Usuário *</label>
                        <Dropdown
                            value={formData.role}
                            options={roleOptions}
                            style={{ zIndex: 5000 }}
                            onChange={(e) => handleInputChange('role', e.value)}
                            placeholder="Selecione o tipo"
                        />
                    </div>

                    <div className="form-field">
                        <label>Senha {!editingUser && '*'}</label>
                        <InputText
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder={editingUser ? 'Deixe em branco para não alterar' : 'Digite a senha'}
                        />
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
                        label={editingUser ? 'Atualizar' : 'Cadastrar'}
                        icon={isSubmitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                        severity={editingUser ? 'warning' : 'success'}
                        onClick={handleSubmit}
                        loading={isSubmitting}
                    />
                </div>
            </Dialog>
        </div>
    );
}

export default Users;
