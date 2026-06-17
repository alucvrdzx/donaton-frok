const router = require('express').Router();
const { createProxy } = require('../middleware/proxyFactory');

router.post('/auth/registrar', createProxy('post', '/api/auth/registrar', { statusCode: 201 }));
router.post('/auth/login',     createProxy('post', '/api/auth/login'));

router.get('/usuarios',        createProxy('get',    '/api/usuarios'));
router.put('/usuarios/:id/rol', createProxy('put',   '/api/usuarios/:id/rol'));
router.delete('/usuarios/:id', createProxy('delete', '/api/usuarios/:id', { statusCode: 204 }));

module.exports = router;
