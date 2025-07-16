import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../../hooks/useAuth';
import './Login.css';
import { Key, User } from '@phosphor-icons/react';
import { VERSION_APP } from '../../../utils/constants';
import { toast } from 'react-toastify';
import Logo from '../../../assets/imgs/Logo-Preta.png'

function Login() {
    const [credentials, setCredentials] = useState({
        user: '',
        password: ''
    });
    const [erros, setErros] = useState({});
    const { login, loading, user } = useAuth();
    const [enviando, setEnviando] = useState(false);
    const navigate = useNavigate();

    if (loading) return <div>Carregando...</div>;
    if (user) return navigate('/home');

    const onChange = (campo, e) => {
        setCredentials({ ...credentials, [campo]: e.target.value });
    }
    const validacao = () => {
        let erros = {}
        if (credentials.user === '') {
            erros.user = 'Campo usuário é obrigatório'
        }
        if (credentials.password === '') {
            erros.password = 'Campo senha é obrigatório'
        }
        if (Object.keys(erros).length > 0) {
            setErros(erros)
            return false
        }
        return true
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        if (!validacao()) {
            setEnviando(false);
            return;
        }
        const result = await login(credentials);
        if (result.status) {
            setErros({});
            setEnviando(false);
            navigate('/home');
        } else {
            setEnviando(false);
            return toast.error(result.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    return (
        <main className="login">
            <div className="container-login">
                <div className="login-right">
                    <div className="img-container">
                        <img src={Logo} alt="Login" className='img-login' />
                    </div>
                    <h1>Olá <br />Seja bem vindo(a)</h1>
                    <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <p>faça o login para acessar o sistema</p>
                        <div className="input-form">
                            <label htmlFor="usuario">Usuário ou email</label>
                            <span className="icon"><User size={24} color='black' /></span>
                            <input
                                className={`${erros.user ? 'error-input' : ''}`}
                                type="text"
                                id="usuario"
                                placeholder="Usuário"
                                value={credentials.user}
                                onChange={(e) => onChange("user", e)}
                            />
                        </div>
                        {erros.user && <span className="error">{erros.user}</span>}
                        <div className="input-form">
                            <span className="icon"><Key size={24} color='black' /></span>
                            <label htmlFor="senha">Senha</label>
                            <input
                                className={`${erros.password ? 'error-input' : ''}`}
                                type="password"
                                placeholder="Senha"
                                id='senha'
                                value={credentials.password}
                                onChange={(e) => onChange("password", e)}
                            />
                        </div>
                        {erros.password && <span className="error">{erros.password}</span>}
                        <Link to="/forgot-password" className="forget-password">
                            Esqueceu a senha?
                        </Link>
                        <button type="submit" className="btn-enter" disabled={enviando}>
                            <span>Entrar</span>
                        </button>
                        <p className="text-register">
                            Não tem conta ainda? <Link to="/register">clique aqui para se cadastrar</Link>
                        </p>
                    </form>
                    <span className="version">Versão {VERSION_APP}</span>
                </div>
            </div>
        </main>
    );
}

export default Login;