const express = require('express');
const router = express.Router();
const db = require('../db');
const autenticarToken = require('../middleware/jsonwebtoken');

router.get('/saldo', autenticarToken, async function(req, res) {
  const clienteId = req.usuario.id;

  try {
    const query = `
      SELECT
        SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) AS total_entradas,
        SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) AS total_saidas
      FROM transacao
      WHERE cliente_id = $1
    `;

    const result = await db.pool.query(query, [clienteId]);
    const { total_entradas, total_saidas } = result.rows[0];

    const saldo = (total_entradas || 0) - (total_saidas || 0);

    res.json({
      cliente_id: clienteId,
      entradas: total_entradas || 0,
      saidas: total_saidas || 0,
      saldo: saldo.toFixed(2),
    });

  } catch (err) {
    console.error('Erro ao calcular saldo:', err);
    res.status(500).json({ erro: 'Erro ao calcular saldo' });
  }
});

router.get('/categoria', async function(req, res, next) {


});

router.get('/periodo`', async function(req, res, next) {


});

module.exports = router;
