const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('transacoes', { title: 'Transacoes'});
});

router.get('/nova',function(req, res, next) {
    res.render('transacoes-registrar', { title: 'Transacoes'});
});

router.get('/editar/:id', function(req, res, next) {
    const id = req.params.id;
    res.render('transacoes-editar', { title: 'Transacoes', transacao_id: id });
});


module.exports = router;