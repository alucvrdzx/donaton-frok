process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Fix para redes corporativas/universitarias con proxy SSL
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sgMail = require('@sendgrid/mail');

const app = express();
const PORT = 3001;

// API Gateway de Spring Boot
const GATEWAY_URL = 'http://localhost:8080';

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

// Permitir peticiones desde React
app.use(cors());
app.use(express.json());

// Helper para retransmitir el token JWT si viene desde el frontend
const getAuthHeaders = (req) => {
    return req.headers.authorization ? { Authorization: req.headers.authorization } : {};
};

// ==========================================
// 📧 FUNCIÓN DE ENVÍO DE EMAIL
// ==========================================

const enviarEmailConfirmacion = async (emailDestinatario, datosDonacion) => {
    const tipoEmoji = {
        'ROPA': '👕',
        'ALIMENTO': '🍎',
        'BEBESTIBLE': '🥤',
        'MONETARIA': '💰',
        'MEDICAMENTO': '💊',
        'HIGIENE': '🧴',
        'JUGUETE': '🧸',
        'ELECTRONICO': '💻'
    };

    const emoji = tipoEmoji[datosDonacion.tipoDonacion] || '📦';

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
                        
                        <!-- Header con gradiente -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%); border-radius: 20px 20px 0 0; padding: 40px 40px 30px 40px; text-align: center;">
                                <h1 style="color: #ffffff; font-size: 32px; margin: 0 0 8px 0; font-weight: 800; letter-spacing: -0.5px;">Donatón</h1>
                                <p style="color: rgba(255,255,255,0.85); font-size: 16px; margin: 0;">Transparencia en Cada Ayuda</p>
                            </td>
                        </tr>

                        <!-- Cuerpo principal -->
                        <tr>
                            <td style="background-color: #1e293b; padding: 40px; border-left: 1px solid rgba(255,255,255,0.08); border-right: 1px solid rgba(255,255,255,0.08);">
                                
                                <!-- Icono de check -->
                                <div style="text-align: center; margin-bottom: 24px;">
                                    <div style="display: inline-block; background: rgba(16, 185, 129, 0.15); border-radius: 50%; width: 72px; height: 72px; line-height: 72px; font-size: 36px;">
                                        ✅
                                    </div>
                                </div>

                                <h2 style="color: #f8fafc; font-size: 24px; text-align: center; margin: 0 0 8px 0; font-weight: 700;">¡Donación Registrada con Éxito!</h2>
                                <p style="color: #94a3b8; text-align: center; font-size: 15px; margin: 0 0 32px 0;">Gracias por tu generosidad, <strong style="color: #e2e8f0;">${datosDonacion.nombreDonante}</strong>. Tu aporte hace la diferencia.</p>

                                <!-- Tarjeta de detalles -->
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden;">
                                    <tr>
                                        <td style="padding: 24px;">
                                            <p style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 16px 0; font-weight: 600;">Detalles de la donación</p>
                                            
                                            <!-- Tipo -->
                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                                                <tr>
                                                    <td style="color: #94a3b8; font-size: 14px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); width: 40%;">Tipo</td>
                                                    <td style="color: #f8fafc; font-size: 14px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: 600; text-align: right;">${emoji} ${datosDonacion.tipoDonacion}</td>
                                                </tr>
                                            </table>

                                            <!-- Producto -->
                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                                                <tr>
                                                    <td style="color: #94a3b8; font-size: 14px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); width: 40%;">Producto</td>
                                                    <td style="color: #f8fafc; font-size: 14px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: 600; text-align: right;">${datosDonacion.detalle}</td>
                                                </tr>
                                            </table>

                                            <!-- Cantidad -->
                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                                                <tr>
                                                    <td style="color: #94a3b8; font-size: 14px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); width: 40%;">Cantidad</td>
                                                    <td style="color: #a78bfa; font-size: 20px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: 800; text-align: right;">${datosDonacion.cantidad}</td>
                                                </tr>
                                            </table>

                                            <!-- Donante -->
                                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="color: #94a3b8; font-size: 14px; padding: 8px 0; width: 40%;">Donante</td>
                                                    <td style="color: #f8fafc; font-size: 14px; padding: 8px 0; font-weight: 600; text-align: right;">${datosDonacion.nombreDonante}</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Mensaje motivacional -->
                                <div style="text-align: center; margin-top: 32px; padding: 20px; background: rgba(99, 102, 241, 0.1); border-radius: 12px; border: 1px solid rgba(99, 102, 241, 0.2);">
                                    <p style="color: #c7d2fe; font-size: 15px; margin: 0; line-height: 1.6;">
                                        🌟 Cada donación cuenta. Gracias a personas como tú, podemos llevar ayuda a quienes más lo necesitan.
                                    </p>
                                </div>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color: rgba(15, 23, 42, 0.8); border-radius: 0 0 20px 20px; padding: 24px 40px; text-align: center; border-left: 1px solid rgba(255,255,255,0.08); border-right: 1px solid rgba(255,255,255,0.08); border-bottom: 1px solid rgba(255,255,255,0.08);">
                                <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">
                                    Este correo fue enviado automáticamente por <strong style="color: #94a3b8;">Donatón</strong>
                                </p>
                                <p style="color: #475569; font-size: 12px; margin: 0;">
                                    Fundación Donatón — Transparencia en Cada Ayuda 💜
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    const msg = {
        to: emailDestinatario,
        from: {
            email: FROM_EMAIL,
            name: 'Donatón'
        },
        subject: `✅ ¡Donación registrada exitosamente! — ${emoji} ${datosDonacion.tipoDonacion}`,
        html: htmlContent,
    };

    try {
        await sgMail.send(msg);
        console.log(`📧 Email de confirmación enviado a: ${emailDestinatario}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando email:', error.response?.body || error.message);
        return false;
    }
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
        // Extraer el email antes de enviar al gateway (el gateway no lo necesita)
        const { emailDonante, ...donacionData } = req.body;

        // 1. Registrar la donación en el microservicio
        const response = await axios.post(`${GATEWAY_URL}/donaciones`, donacionData, { headers: getAuthHeaders(req) });

        // 2. Enviar email de confirmación si se proporcionó un correo
        let emailEnviado = false;
        if (emailDonante && emailDonante.trim()) {
            emailEnviado = await enviarEmailConfirmacion(emailDonante.trim(), donacionData);
        }

        res.status(201).json({
            ...response.data,
            emailEnviado,
            mensaje: emailEnviado
                ? '¡Donación registrada! Se envió un correo de confirmación.'
                : '¡Donación registrada exitosamente!'
        });
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

app.put('/api/inventario/:id', async (req, res) => {
    try {
        const response = await axios.put(`${GATEWAY_URL}/inventario/${req.params.id}`, req.body, { headers: getAuthHeaders(req) });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar inventario' });
    }
});

app.delete('/api/inventario/:id', async (req, res) => {
    try {
        await axios.delete(`${GATEWAY_URL}/inventario/${req.params.id}`, { headers: getAuthHeaders(req) });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar inventario' });
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
    console.log(`📧 SendGrid configurado con remitente: ${FROM_EMAIL}`);
});
