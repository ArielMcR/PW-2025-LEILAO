import React, { useEffect, useState } from 'react'
import './ForgotPassword.css'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Divider } from 'primereact/divider'
import { useNavigate, useLocation } from 'react-router'
import Api from '../../../api/api'
import { toast } from 'react-toastify'
import GenericLoader from '../../../components/GenericLoader/GenericLoader'
import { CheckCircle } from 'lucide-react'
import { Key } from '@phosphor-icons/react'
import Swal from 'sweetalert2'

function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [focus, setFocus] = useState(false);
    const [mudaTela, setMudaTela] = useState(1);
    const [loader, setLoader] = useState(false);
    const [token, setToken] = useState('');
    const [form, setForm] = useState({
        newPassword: '',
        confirmNewPassword: '',
    });
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        number: false,
        special: false,
        uppercase: false,
    });
    const [errors, setErrors] = useState({});

    const location = useLocation();
    const navigate = useNavigate();

    const onChange = (field, e) => {
        const value = e.target.value;
        setForm({ ...form, [field]: value });

        if (field === 'newPassword') {
            setPasswordRequirements({
                length: value.length >= 8 && value.length <= 20,
                number: /[0-9]/.test(value),
                special: /[!@#$%^&*(),.?":{}|<>_\-+=~`]/.test(value),
                uppercase: /[A-Z]/.test(value),
            });
        }
    };

    const SubmitEmail = async () => {
        if (email) {
            setLoader(true);
            try {
                const result = await Api.post(`/forgot-password/verifyMail/${email}`);
                if (result.status === 200) {
                    toast.success('Email enviado com sucesso! Verifique sua caixa de entrada ou spam.');
                    Swal.fire({
                        title: 'Email enviado',
                        text: 'Verifique sua caixa de entrada ou spam para o link de redefinição de senha.',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                        customClass: {
                            confirmButton: 'p-button p-component p-button-raised p-button-success'
                        }
                    }).then(() => {
                        navigate(-1)
                    }
                    );
                }
            } catch (error) {
                toast.error('Erro ao enviar o email. Verifique se o email está correto e tente novamente.');
            } finally {
                setLoader(false);
            }
        }
    };

    const submitNewPassword = async () => {
        if (form.newPassword !== form.confirmNewPassword) {
            setErrors({ confirmNewPassword: 'As senhas não coincidem.' });
            return;
        }
        if (!passwordRequirements.length || !passwordRequirements.number || !passwordRequirements.special || !passwordRequirements.uppercase) {
            setErrors({
                newPassword: 'A senha deve atender aos requisitos de segurança.',
                confirmNewPassword: 'A senha deve atender aos requisitos de segurança.'
            });
            return;
        }
        setLoader(true);
        try {
            const result = await Api.post(`/forgot-password/changePassword?token=${token}`, { newPassword: form.newPassword });
            if (result.status === 200) {
                toast.success('Senha redefinida com sucesso! Você pode fazer login agora.');
                navigate('/');
            } else {
                toast.error(`Erro ao redefinir a senha. Tente novamente.${result.message ? ` ${result.message}` : ''}`);
            }
        } catch (error) {
            toast.error('Erro ao redefinir a senha. Tente novamente.');
        } finally {
            setLoader(false);
        }
    };

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const t = query.get('token');
        if (t) {
            setToken(t);
            setMudaTela(2);
        }
    }, [location]);

    return (
        <>
            {loader && <GenericLoader />}
            {mudaTela === 1 && (
                <div className="container background-forgot-password">
                    <div className="forgot-password">
                        <h2>Esqueci minha senha</h2>
                        <p className='subtext'> Para receber o link de redefinição da senha, informe o email cadastrado.</p>
                        <div className='container-input-forgot'>
                            <label htmlFor="username">Email</label>
                            <InputText id="username" value={email} onChange={(e) => setEmail(e.target.value)} className={`input-password-forgot ${email.length > 0 && !focus ? 'has-value' : email.length === 0 ? 'has-no-value' : ''}`} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} />
                        </div>
                        <br />
                        <Divider />
                        <div className="forgot-password-button">
                            <Button label="Enviar" className="p-button-raised p-button-primary button-forgot" disabled={!email} onClick={() => SubmitEmail()} />
                            <Button label="Voltar" className="button-forgot button-back" onClick={() => { navigate(-1) }} />
                        </div>
                    </div>
                </div>
            )}
            {mudaTela === 2 && (
                <div className="container background-forgot-password">
                    <div className="forgot-password">
                        <h2>Redefinição de senha</h2>
                        <p className='subtext'>Por favor, insira sua nova senha.</p>
                        <div className="input-form register-input-form" style={{ width: '100%' }}>
                            <label htmlFor="password">Senha</label>
                            <span className="icon">
                                <Key size={24} color="black" />
                            </span>
                            <input
                                type="password"
                                id="password"
                                placeholder="Digite sua senha"
                                value={form.newPassword}
                                onChange={(e) => onChange('newPassword', e)}
                                className={`${errors.newPassword ? 'error-input' : ''}`}
                            />
                        </div>
                        {errors.newPassword && <span className="register-error">{errors.newPassword}</span>}
                        <ul className="password-requirements">
                            <li className={passwordRequirements.length ? 'met' : 'unmet'}>
                                <CheckCircle size={16} /> 8 a 20 caracteres
                            </li>
                            <li className={passwordRequirements.number ? 'met' : 'unmet'}>
                                <CheckCircle size={16} /> Pelo menos 1 número
                            </li>
                            <li className={passwordRequirements.special ? 'met' : 'unmet'}>
                                <CheckCircle size={16} /> Pelo menos 1 caractere especial
                            </li>
                            <li className={passwordRequirements.uppercase ? 'met' : 'unmet'}>
                                <CheckCircle size={16} /> Pelo menos 1 letra maiúscula
                            </li>
                        </ul>
                        <div className="input-form register-input-form" style={{ width: '100%' }}>
                            <label htmlFor="confirmNewPassword">Confirmar Senha</label>
                            <span className="icon">
                                <Key size={24} color="black" />
                            </span>
                            <input
                                type="password"
                                id="confirmNewPassword"
                                placeholder="Confirme sua senha"
                                value={form.confirmNewPassword}
                                onChange={(e) => onChange('confirmNewPassword', e)}
                                className={`${errors.confirmNewPassword ? 'error-input' : ''}`}
                            />
                            {errors.confirmNewPassword && <span className="register-error">{errors.confirmNewPassword}</span>}
                        </div>
                        <div className="forgot-password-button">
                            <Button label="Voltar" className="button-forgot button-back" onClick={() => { setMudaTela(1) }} />
                            <Button label="Confirmar" className="button-forgot button-confirm" onClick={() => submitNewPassword()} />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ForgotPassword
