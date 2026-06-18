const router = require('express').Router();
const axios = require('axios');
const { GATEWAY_URL } = require('../config');
const { createProxy, getAuthHeaders } = require('../middleware/proxyFactory');
const { enviarEmailConfirmacion } = require('../services/emailService');

// Standard CRUD routes via proxy
router.get('/donaciones',              createProxy('get',    '/donaciones', { passQuery: true }));
router.get('/donaciones/:id',          createProxy('get',    '/donaciones/:id'));
router.get('/donaciones/tipo/:tipo',   createProxy('get',    '/donaciones/tipo/:tipo', { passQuery: true }));
router.get('/donaciones/detalle/:detalle', createProxy('get', '/donaciones/detalle/:detalle', { passQuery: true }));
router.put('/donaciones/:id',          createProxy('put',    '/donaciones/:id'));
router.delete('/donaciones/:id',       createProxy('delete', '/donaciones/:id'));

// POST with custom email logic — cannot use generic proxy
router.post('/donaciones', async (req, res) => {
    try {
        const { emailDonante, ...donacionData } = req.body;

        // 1. Registrar la donación en el microservicio
        const response = await axios.post(`${GATEWAY_URL}/donaciones`, donacionData, {
            headers: getAuthHeaders(req)
        });

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
        const status = error.response?.status || 500;
        res.status(status).json(error.response?.data || { error: 'Error conectando con el backend de donaciones' });
    }
});

module.exports = router;
