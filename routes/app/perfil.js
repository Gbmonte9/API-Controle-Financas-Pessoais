const express = require('express');
const router = express.Router();
// tenho que coloca o autenticarToken
/* GET home page. */
const autenticarToken = require('../../middlewares/jsonwebtoken');
const db = require('../../db'); 

router.get('/', (req, res) => {
  res.render('perfil', {
    title: 'Perfil do Cliente',
    nome: '',
    email: '',
    mensagemSucesso: null
  });
});

// API
router.get('/api/cliente/perfil', autenticarToken, async (req, res) => {
  try {
    const clienteId = req.usuario.id; 

    const query = 'SELECT nome, email FROM cliente WHERE id = $1';
    const result = await db.pool.query(query, [clienteId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const cliente = result.rows[0];

    res.json({ nome: cliente.nome, email: cliente.email });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao carregar perfil' });
  }
});


module.exports = router;