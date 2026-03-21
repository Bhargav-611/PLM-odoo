import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api'
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
