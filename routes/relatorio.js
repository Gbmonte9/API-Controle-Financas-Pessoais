const express = require('express');
const router = express.Router();
const db = require('../db');
const autenticarToken = require('../middlewares/jsonwebtoken');

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

router.get('/categoria', autenticarToken, async function(req, res) {
  const clienteId = req.usuario.id;

  try {
    const query = `
      SELECT
        categoria,
        SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) AS total_entradas,
        SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) AS total_saidas
      FROM transacao
      WHERE cliente_id = $1
      GROUP BY categoria
      ORDER BY categoria
    `;

    const result = await db.pool.query(query, [clienteId]);

    res.json(result.rows);

  } catch (err) {
    console.error('Erro ao calcular totais por categoria:', err);
    res.status(500).json({ erro: 'Erro ao calcular totais por categoria' });
  }
});

router.get('/periodo', autenticarToken, async function(req, res) {
  const clienteId = req.usuario.id;
  const { data_inicio, data_fim } = req.query;

  if (!data_inicio || !data_fim) {
    return res.status(400).json({ erro: 'É necessário informar data_inicio e data_fim' });
  }

  try {
    const query = `
      SELECT
        SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) AS total_entradas,
        SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) AS total_saidas
      FROM transacao
      WHERE cliente_id = $1
        AND criado_em BETWEEN $2 AND $3
    `;

    const result = await db.pool.query(query, [clienteId, data_inicio, data_fim]);
    const { total_entradas, total_saidas } = result.rows[0];

    res.json({
      cliente_id: clienteId,
      entradas: total_entradas || 0,
      saidas: total_saidas || 0
    });

  } catch (err) {
    console.error('Erro ao calcular totais por período:', err);
    res.status(500).json({ erro: 'Erro ao calcular totais por período' });
  }
});

module.exports = router;
