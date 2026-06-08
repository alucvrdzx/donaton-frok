const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

// API Gateway de Spring Boot
const GATEWAY_URL = 'http://localhost:8080';

// Permitir peticiones desde React
app.use(cors());
app.use(express.json());

// Helper para retransmitir el token JWT si viene desde el frontend
const getAuthHeaders = (req) => {
    return req.headers.authorization ? { Authorization: req.headers.authorization } : {};
};

// ==========================================
// 🔐 AUTENTICACIÓN Y USUARIOS
// ==========================================

app.post('/api/auth/registrar', async (req, res) => {
    try {
        const response = await axios.post(`${GATEWAY_URL}/api/auth/registrar`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Error en el registro' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const response = await axios.post(`${GATEWAY_URL}/api/auth/login`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Error en el login' });
    }
});

app.get('/api/usuarios', async (req, res) => {
    try {
        const response = await axios.get(`${GATEWAY_URL}/api/usuarios`, { headers: getAuthHeaders(req) });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Error al obtener usuarios' });
    }
});

app.put('/api/usuarios/:id/rol', async (req, res) => {
    try {
        const response = await axios.put(`${GATEWAY_URL}/api/usuarios/${req.params.id}/rol`, req.body, { headers: getAuthHeaders(req) });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Error al actualizar rol de usuario' });
    }
});

app.delete('/api/usuarios/:id', async (req, res) => {
    try {
        const response = await axios.delete(`${GATEWAY_URL}/api/usuarios/${req.params.id}`, { headers: getAuthHeaders(req) });
        res.status(204).send();
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Error al eliminar usuario' });
    }
});

// ==========================================
// 📦 DONACIONES
// ==========================================

app.get('/api/donaciones', async (req, res) => {
    try {
        const response = await axios.get(`${GATEWAY_URL}/donaciones`, { headers: getAuthHeaders(req) });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error conectando con el backend de donaciones' });
    }
});

app.post('/api/donaciones', async (req, res) => {
    try {
        const response = await axios.post(`${GATEWAY_URL}/donaciones`, req.body, { headers: getAuthHeaders(req) });
        res.status(201).json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error conectando con el backend de donaciones' });
    }
});

app.get('/api/donaciones/:id', async (req, res) => {
    try {
        const response = await axios.get(`${GATEWAY_URL}/donaciones/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la donación' });
    }
});

app.get('/api/donaciones/tipo/:tipo', async (req, res) => {
    try {
        const response = await axios.get(`${GATEWAY_URL}/donaciones/tipo/${req.params.tipo}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error al filtrar por tipo' });
    }
});

app.get('/api/donaciones/detalle/:detalle', async (req, res) => {
    try {
        const response = await axios.get(`${GATEWAY_URL}/donaciones/detalle/${req.params.detalle}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar por detalle' });
    }
});

app.put('/api/donaciones/:id', async (req, res) => {
    try {
        const response = await axios.put(`${GATEWAY_URL}/donaciones/${req.params.id}`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la donación' });
    }
});

app.delete('/api/donaciones/:id', async (req, res) => {
    try {
        const response = await axios.delete(`${GATEWAY_URL}/donaciones/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la donación' });
    }
});

// ==========================================
// 🗄️ INVENTARIO
// ==========================================

app.get('/api/inventario', async (req, res) => {
    try {
        const response = await axios.get(`${GATEWAY_URL}/inventario`, { headers: getAuthHeaders(req) });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error conectando con el backend de inventario' });
    }
});

app.post('/api/inventario', async (req, res) => {
    try {
        const response = await axios.post(`${GATEWAY_URL}/inventario`, req.body, { headers: getAuthHeaders(req) });
        res.status(201).json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error conectando con el backend de inventario' });
    }
});

// ==========================================
// 🚚 LOGÍSTICA
// ==========================================

app.get('/api/logistica', async (req, res) => {
    try {
        const response = await axios.get(`${GATEWAY_URL}/logistica`, { headers: getAuthHeaders(req) });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error conectando con el backend de logística' });
    }
});

app.post('/api/logistica', async (req, res) => {
    try {
        const response = await axios.post(`${GATEWAY_URL}/logistica`, req.body, { headers: getAuthHeaders(req) });
        res.status(201).json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error conectando con el backend de logística' });
    }
});

app.get('/api/logistica/:id', async (req, res) => {
    try {
        const response = await axios.get(`${GATEWAY_URL}/logistica/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el envío' });
    }
});

app.put('/api/logistica/:id/estado', async (req, res) => {
    try {
        const response = await axios.put(`${GATEWAY_URL}/logistica/${req.params.id}/estado`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar estado del envío' });
    }
});

app.put('/api/logistica/:id', async (req, res) => {
    try {
        const response = await axios.put(`${GATEWAY_URL}/logistica/${req.params.id}`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el envío' });
    }
});

app.delete('/api/logistica/:id', async (req, res) => {
    try {
        await axios.delete(`${GATEWAY_URL}/logistica/${req.params.id}`);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el envío' });
    }
});

// ==========================================
// 🆘 NECESIDADES
// ==========================================

app.get('/api/necesidades', async (req, res) => {
    try {
        const response = await axios.get(`${GATEWAY_URL}/necesidades`, { headers: getAuthHeaders(req) });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Error conectando con el backend de necesidades' });
    }
});

app.post('/api/necesidades', async (req, res) => {
    try {
        const response = await axios.post(`${GATEWAY_URL}/necesidades`, req.body, { headers: getAuthHeaders(req) });
        res.status(201).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Error conectando con el backend de necesidades' });
    }
});

app.get('/api/necesidades/:id', async (req, res) => {
    try {
        const response = await axios.get(`${GATEWAY_URL}/necesidades/${req.params.id}`, { headers: getAuthHeaders(req) });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Error al obtener la necesidad' });
    }
});

app.patch('/api/necesidades/:id/estado', async (req, res) => {
    try {
        const response = await axios.patch(`${GATEWAY_URL}/necesidades/${req.params.id}/estado`, null, {
            params: req.query,
            headers: getAuthHeaders(req)
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Error al actualizar estado de la necesidad' });
    }
});

app.delete('/api/necesidades/:id', async (req, res) => {
    try {
        await axios.delete(`${GATEWAY_URL}/necesidades/${req.params.id}`, { headers: getAuthHeaders(req) });
        res.status(204).send();
    } catch (error) {
        res.status(error.response?.status || 500).json(error.response?.data || { error: 'Error al eliminar la necesidad' });
    }
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(PORT, () => {
    console.log(`🚀 BFF (Node.js) corriendo en http://localhost:${PORT}`);
    console.log(`🔌 Conectado al API Gateway de Spring Boot en ${GATEWAY_URL}`);
});
