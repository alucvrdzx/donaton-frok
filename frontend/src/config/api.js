const API_BASE_URL = 'https://option-laden-investigator-careful.trycloudflare.com';

const getAuthHeader = () => {
    const user = localStorage.getItem('user');
    if (user) {
        const parsed = JSON.parse(user);
        if (parsed.token) {
            return { Authorization: `Bearer ${parsed.token}` };
        }
    }
    return {};
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error del servidor' }));
        throw { status: response.status, ...error };
    }
    if (response.status === 204) return null;
    return response.json();
};

export const api = {
    get: (path) =>
        fetch(`${API_BASE_URL}${path}`, {
            headers: { ...getAuthHeader() }
        }).then(handleResponse),

    post: (path, body) =>
        fetch(`${API_BASE_URL}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(body)
        }).then(handleResponse),

    put: (path, body) =>
        fetch(`${API_BASE_URL}${path}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
            body: JSON.stringify(body)
        }).then(handleResponse),

    patch: (path, queryParams = {}) => {
        const url = new URL(`${API_BASE_URL}${path}`);
        Object.entries(queryParams).forEach(([k, v]) => url.searchParams.set(k, v));
        return fetch(url.toString(), {
            method: 'PATCH',
            headers: { ...getAuthHeader() }
        }).then(handleResponse);
    },

    delete: (path) =>
        fetch(`${API_BASE_URL}${path}`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() }
        }).then(handleResponse),
};

export default api;
