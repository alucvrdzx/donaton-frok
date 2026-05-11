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
// ENDPOINTS DEL BFF (Lo que React va a llamar)
// ==========================================

// 1. Listar donaciones
app.get('/api/donaciones', async (req, res) => {
    try {
        // El BFF llama al Gateway de Spring Boot
        const response = await axios.get(`${GATEWAY_URL}/donaciones`);
        res.json(response.data);
    } catch (error) {
        console.error('Error al obtener donaciones:', error.message);
        res.status(500).json({ error: 'Error conectando con el backend de donaciones' });
    }
});

// 2. Crear donación
app.post('/api/donaciones', async (req, res) => {
    try {
        const response = await axios.post(`${GATEWAY_URL}/donaciones`, req.body);
        res.status(201).json(response.data);
    } catch (error) {
        console.error('Error al crear donación:', error.message);
        res.status(500).json({ error: 'Error conectando con el backend de donaciones' });
    }
});

// 3. Obtener el inventario
app.get('/api/inventario', async (req, res) => {
    try {
        const response = await axios.get(`${GATEWAY_URL}/inventario`); // Asumiendo ruta en Gateway
        res.json(response.data);
    } catch (error) {
        console.error('Error al obtener inventario:', error.message);
        res.status(500).json({ error: 'Error conectando con el backend de inventario' });
    }
});

// Iniciar el servidor BFF
app.listen(PORT, () => {
    console.log(`🚀 BFF (Node.js) corriendo en http://localhost:${PORT}`);
    console.log(`🔌 Conectado al API Gateway de Spring Boot en ${GATEWAY_URL}`);
});
