const router = require('express').Router();
const { createProxy } = require('../middleware/proxyFactory');

router.get('/inventario',      createProxy('get',    '/inventario'));
router.post('/inventario',     createProxy('post',   '/inventario', { statusCode: 201 }));
router.put('/inventario/:id',  createProxy('put',    '/inventario/:id'));
router.delete('/inventario/:id', createProxy('delete', '/inventario/:id', { statusCode: 204 }));

module.exports = router;
