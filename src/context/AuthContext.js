import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import users from '../data/users.json';
import Api from "../api/api";
import socketService from "../services/socket";

export const AuthContext = createContext();

function AuthContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];
        if (token) {
            try {
                const payload = jwtDecode(token);
                setUser({ id: payload.id, role: payload.role });

                // Conecta o socket se houver token válido
                socketService.connect(token);
            } catch (error) {
                console.error('Token inválido', error);
                setUser(null);
            }
        }
        setLoading(false);

        // Cleanup: desconecta socket quando o componente desmonta
        return () => {
            socketService.disconnect();
        };
    }, []);

    const login = async (credential) => {
        const { user, password } = credential;
        try {
            const result = await Api.post('auth/login', {
                name: user,
                password: password
            });
            if (result.status === 200 && result.data.token) {
                const token = result.data.token;
                document.cookie = `token=${token}; path=/; max-age=3600`;
                const payload = jwtDecode(token);
                setUser({ id: payload.id, role: payload.role, name: payload.name });

                // Conecta o socket após login bem-sucedido
                socketService.connect(token);

                // Retorna a role para redirecionar corretamente
                return {
                    status: true,
                    role: payload.role
                };
            }
            else {
                setUser(null);
                return { status: false, message: 'Usuário não encontrado, senha inválida ou credenciais inválidas' };
            }
        } catch (error) {
            return { status: false, message: 'Erro ao fazer login. Tente novamente mais tarde.' };
        }
    };

    const logout = () => {
        setUser(null);
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';

        // Desconecta o socket ao fazer logout
        socketService.disconnect();
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider;
