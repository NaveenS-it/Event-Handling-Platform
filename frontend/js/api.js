const API_URL = 'http://localhost:5000/api';

const showToast = (message, type = 'success') => {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

const getHeaders = (isMultipart = false) => {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isMultipart) headers['Content-Type'] = 'application/json';
    return headers;
};

const API = {
    async get(endpoint) {
        const res = await fetch(`${API_URL}${endpoint}`, { headers: getHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Something went wrong');
        return data;
    },

    async post(endpoint, body) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Something went wrong');
        return data;
    },

    async put(endpoint, body) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Something went wrong');
        return data;
    },

    async delete(endpoint) {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Something went wrong');
        return data;
    }
};
