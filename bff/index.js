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

// ==========================================
// 📦 DONACIONES
// ==========================================

app.get('/api/donaciones', async (req, res) => {
    try {
        const response = await axios.get(`${GATEWAY_URL}/donaciones`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error conectando con el backend de donaciones' });
    }
});

app.post('/api/donaciones', async (req, res) => {
    try {
        const response = await axios.post(`${GATEWAY_URL}/donaciones`, req.body);
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
        const response = await axios.get(`${GATEWAY_URL}/inventario`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error conectando con el backend de inventario' });
    }
});

app.post('/api/inventario', async (req, res) => {
    try {
        const response = await axios.post(`${GATEWAY_URL}/inventario`, req.body);
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
        const response = await axios.get(`${GATEWAY_URL}/logistica`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error conectando con el backend de logística' });
    }
});

app.post('/api/logistica', async (req, res) => {
    try {
        const response = await axios.post(`${GATEWAY_URL}/logistica`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error conectando con el backend de logística' });
    }
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(PORT, () => {
    console.log(`🚀 BFF (Node.js) corriendo en http://localhost:${PORT}`);
    console.log(`🔌 Conectado al API Gateway de Spring Boot en ${GATEWAY_URL}`);
});
