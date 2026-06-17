const router = require('express').Router();
const { createProxy } = require('../middleware/proxyFactory');

router.get('/logistica',              createProxy('get',    '/logistica'));
router.post('/logistica',             createProxy('post',   '/logistica', { statusCode: 201 }));
router.get('/logistica/:id',          createProxy('get',    '/logistica/:id'));
router.put('/logistica/:id/estado',   createProxy('put',    '/logistica/:id/estado'));
router.put('/logistica/:id',          createProxy('put',    '/logistica/:id'));
router.delete('/logistica/:id',       createProxy('delete', '/logistica/:id', { statusCode: 204 }));

module.exports = router;
