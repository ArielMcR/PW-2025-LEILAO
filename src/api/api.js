import axios from "axios";

const API_URL = process.env.REACT_APP_URL_BACK_END;

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

const getTokenFromCookie = () => {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        const [name, value] = cookie.split("=");
        if (name === "token") {
            return value;
        }
    }
    return null;
};

api.interceptors.request.use(
    (config) => {
        const token = getTokenFromCookie();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const Api = {
    get: async (route) => {
        return api.get(route);
    },
    post: async (route, data) => {
        return api.post(route, data);
    },
    put: async (route, data) => {
        return api.put(route, data);
    },
    delete: async (route) => {
        return api.delete(route);
    },
};

export default Api;