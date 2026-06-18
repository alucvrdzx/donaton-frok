const router = require('express').Router();
const { createProxy } = require('../middleware/proxyFactory');

router.get('/necesidades',              createProxy('get',    '/necesidades', { passQuery: true }));
router.post('/necesidades',             createProxy('post',   '/necesidades', { statusCode: 201 }));
router.get('/necesidades/:id',          createProxy('get',    '/necesidades/:id'));
router.patch('/necesidades/:id/estado', createProxy('patch',  '/necesidades/:id/estado', { passQuery: true }));
router.delete('/necesidades/:id',       createProxy('delete', '/necesidades/:id', { statusCode: 204 }));

module.exports = router;
