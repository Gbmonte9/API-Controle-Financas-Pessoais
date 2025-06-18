const express = require('express');
const router = express.Router();
const db = require('../db');
const autenticarToken = require('../middlewares/jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { hashSenha, compararSenha } = require('../middlewares/bcrypt');
require('dotenv').config();

// Todos os GET

router.get('/dados', autenticarToken, async function(req, res) {
  try {
    
    const vquery = "SELECT id, cliente_id, tipo, descricao, valor, categoria, criado_em FROM transacao";
    const vtransacao = await db.pool.query(vquery);

    res.json(vtransacao.rows);  // ✅ retorna apenas os dados
  } catch (err) {
    console.error('Erro ao buscar transacao:', err);
    res.status(500).json({ erro: 'Erro ao buscar dados' });
  }
});

router.get('/dados/cliente_id/:ClientId', autenticarToken, async (req, res) => {
  
  try {
    
    const cliente_id = req.params.ClientId.toLowerCase();

    const query = `
      SELECT id, cliente_id, tipo, descricao, valor, categoria, criado_em
      FROM transacao
      WHERE cliente_id LIKE $1
    `;

    const values = [`%${cliente_id}%`]; // único parâmetro com wildcard para LIKE

    const result = await db.pool.query(query, values);

    res.json(result.rows); // retorna os dados encontrados
  } catch (err) {
    console.error('Erro ao buscar transacao:', err);
    res.status(500).json({ erro: 'Erro ao buscar dados' });
  }
});

// ===============================

// Todos os POST

router.post('/', autenticarToken, async function(req, res) {
  const { tipo, descricao, valor, categoria } = req.body;

  try {
    const transacao = {
      id: uuidv4(),
      cliente_id: req.cliente.id, // ← pega o ID do cliente autenticado via token
      tipo,
      descricao,
      valor,
      categoria,
      criado_em: new Date(),
    };

    const query = `
      INSERT INTO transacao (id, cliente_id, tipo, descricao, valor, categoria, criado_em)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      transacao.id,
      transacao.cliente_id,
      transacao.tipo,
      transacao.descricao,
      transacao.valor,
      transacao.categoria,
      transacao.criado_em,
    ];

    const result = await db.pool.query(query, values);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Erro ao registrar transação:', err);
    res.status(500).json({ erro: 'Erro ao registrar transação' });
  }
});

// ====================

module.exports = router;
