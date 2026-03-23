import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL;

const API = axios.create({
    baseURL: BASE_URL
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    if (role) {
        req.headers.role = role;
    }
    return req;
});

export default API;
