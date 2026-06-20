require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { PORT } = require('./config');

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api', require('./routes/auth.routes'));
app.use('/api', require('./routes/donaciones.routes'));
app.use('/api', require('./routes/inventario.routes'));
app.use('/api', require('./routes/logistica.routes'));
app.use('/api', require('./routes/necesidades.routes'));

// Start server
app.listen(PORT, () => {
    console.log(`🚀 BFF (Node.js) corriendo en http://localhost:${PORT}`);
    console.log(`🔌 Conectado al API Gateway de Spring Boot`);
    console.log(`📧 SendGrid configurado con remitente: ${process.env.SENDGRID_FROM_EMAIL}`);
});
