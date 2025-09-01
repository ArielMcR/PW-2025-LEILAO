import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import users from '../data/users.json';
import Api from "../api/api";

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
            } catch (error) {
                console.error('Token inválido', error);
                setUser(null);
            }
        }
        setLoading(false);
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
                return { status: true };
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
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider;
