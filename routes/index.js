const express = require('express');
const router = express.Router();
const db = require('../db');

/* GET home page. */
router.get('/', async function(req, res, next) {

  try {
    
    await db.inicializacao();  

    res.render('index', { title: 'Login', mensagem: 'Banco de dados inicializado com sucesso!'});
  } catch (err) {
    console.error('Erro ao inicializar banco:', err);
    res.status(500).render('index', { title: 'Express', mensagem: 'Erro ao inicializar banco de dados'});
  }

});

module.exports = router;
