import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

export const getProducts = () => api.get('/products');
export const getBoMsByProduct = (productId) => api.get(`/bom/product/${productId}`);
export const createDraft = (data) => api.post('/bom/create-draft', data);
export const updateDraft = (id, data) => api.put(`/bom/update-draft/${id}`, data);
export const sendForApproval = (id) => api.post(`/bom/send-for-approval/${id}`);
export const approveBoM = (id) => api.post(`/bom/approve/${id}`);
export const rejectBoM = (id) => api.post(`/bom/reject/${id}`);
export const getCompare = (id) => api.get(`/bom/compare/${id}`);

export default api;
