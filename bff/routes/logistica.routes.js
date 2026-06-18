const router = require('express').Router();
const { createProxy } = require('../middleware/proxyFactory');

router.get('/logistica',              createProxy('get',    '/logistica', { passQuery: true }));
router.post('/logistica',             createProxy('post',   '/logistica', { statusCode: 201 }));
router.get('/logistica/:id',          createProxy('get',    '/logistica/:id'));
router.put('/logistica/:id/estado',   createProxy('put',    '/logistica/:id/estado'));
router.put('/logistica/:id',          createProxy('put',    '/logistica/:id'));
router.delete('/logistica/:id',       createProxy('delete', '/logistica/:id', { statusCode: 204 }));

// Sedes
router.get('/sedes',                  createProxy('get',    '/logistica/sedes', { passQuery: true }));
router.post('/sedes',                 createProxy('post',   '/logistica/sedes', { statusCode: 201 }));
router.get('/sedes/cercana',          createProxy('get',    '/logistica/sedes/cercana', { passQuery: true }));

module.exports = router;
