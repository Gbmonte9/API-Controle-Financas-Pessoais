const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('transacoes', { title: 'Minhas Transações'});
});

router.get('/nova',function(req, res, next) {
    res.render('transacoes-registrar', { title: 'Fazer Transacoes'});
});

router.get('/editar/:id', function(req, res, next) {
    const id = req.params.id;
    res.render('transacoes-editar', { title: 'Ediatr Transacoes', transacao_id: id });
});


module.exports = router;