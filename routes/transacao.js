const express = require('express');
const router = express.Router();
const db = require('../db');
const autenticarToken = require('../middlewares/jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Todos os GET

router.get('/dados', autenticarToken, async function(req, res) {
  try {
    
    const vquery = "SELECT id, cliente_id, tipo, descricao, valor, categoria, criado_em FROM transacao";
    const vtransacao = await db.pool.query(vquery);

    res.json(vtransacao.rows);  
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

    const values = [`%${cliente_id}%`]; 

    const result = await db.pool.query(query, values);

    res.json(result.rows); 
  } catch (err) {
    console.error('Erro ao buscar transacao:', err);
    res.status(500).json({ erro: 'Erro ao buscar dados' });
  }
});

router.get('/dados/transacao_id/:idTransacao', autenticarToken, async (req, res) => {
  try {
    const transacaoId = req.params.idTransacao;

    const query = `
      SELECT id, cliente_id, tipo, descricao, valor, categoria, criado_em
      FROM transacao
      WHERE id = $1
    `;

    const values = [transacaoId];

    const result = await db.pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Transação não encontrada' });
    }

    res.json(result.rows[0]); 

  } catch (err) {
    console.error('Erro ao buscar transacao:', err);
    res.status(500).json({ erro: 'Erro ao buscar dados' });
  }
});

router.get('/filtrar/cliente_id/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  const { categoria, data, valor, tipo } = req.query;

  let query = 'SELECT * FROM transacao WHERE cliente_id = $1';
  const params = [id];
  let paramIndex = 2;

  const adicionarFiltro = (condicao, valorFiltro) => {
    query += ` AND ${condicao}`;
    params.push(valorFiltro);
    paramIndex++;
  };

  if (categoria) {
    adicionarFiltro(`categoria ILIKE $${paramIndex}`, `%${categoria}%`);
  }

  if (data) {
    adicionarFiltro(`DATE(criado_em) = $${paramIndex}`, data);
  }

  if (valor) {
    adicionarFiltro(`valor = $${paramIndex}`, parseFloat(valor));
  }

  if (tipo) {
    adicionarFiltro(`tipo = $${paramIndex}`, tipo);
  }

  try {
    const result = await db.pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar transações filtradas' });
  }
});

// ===============================

// Todos os POST

router.post('/', autenticarToken, async (req, res) => {
  const { tipo, descricao, valor, categoria } = req.body;
  const clienteId = req.usuario?.id;

  console.log(`ClienteId: ${clienteId}`);

  if (!tipo || !descricao || !valor || !categoria) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
  }

  try {
    const transacao = {
      id: uuidv4(),
      cliente_id: clienteId,
      tipo,
      descricao,
      valor,
      categoria,
      criado_em: new Date()
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
      transacao.criado_em
    ];

    const result = await db.pool.query(query, values);

    res.status(201).json({
      transacao: result.rows[0],
      mensagem: 'Transação cadastrada com sucesso!'
    });

  } catch (err) {
    console.error('❌ Erro ao registrar transação:', err);
    res.status(500).json({ erro: 'Erro ao registrar transação. Tente novamente mais tarde.' });
  }
});


// ====================

// PUT 

router.put('/:id', autenticarToken, async function (req, res) {
  const usuario_id = req.usuario.id;
  const transacao_id = req.params.id;
  const { tipo, descricao, valor, categoria } = req.body;

  if (!tipo || !descricao || !valor || !categoria) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
  }

  try {
    const verificaQuery = 'SELECT cliente_id FROM transacao WHERE id = $1';
    const verificaResult = await db.pool.query(verificaQuery, [transacao_id]);

    if (verificaResult.rows.length === 0) {
      return res.status(404).json({ erro: 'Transação não encontrada.' });
    }

    if (verificaResult.rows[0].cliente_id !== usuario_id) {
      return res.status(403).json({ erro: 'Você não tem permissão para alterar esta transação.' });
    }

    const updateQuery = `
      UPDATE transacao
      SET tipo = $1,
          descricao = $2,
          valor = $3,
          categoria = $4
      WHERE id = $5
      RETURNING *
    `;

    const values = [tipo, descricao, valor, categoria, transacao_id];
    const updateResult = await db.pool.query(updateQuery, values);

    res.json({
      dados: updateResult.rows[0],
      mensagem: 'Transação atualizada com sucesso!'
    });

  } catch (err) {
    console.error('❌ Erro ao atualizar transação:', err);
    res.status(500).json({ erro: 'Erro ao atualizar transação. Tente novamente mais tarde.' });
  }
});


// =====================

// Delete

router.delete('/deletar/:id', autenticarToken, async (req, res) => {
  const cliente_id = req.usuario.id; 
  const transacao_id = req.params.id;

  try {
    const verificaQuery = 'SELECT * FROM transacao WHERE id = $1 AND cliente_id = $2';
    const verificaResult = await db.pool.query(verificaQuery, [transacao_id, cliente_id]);

    if (verificaResult.rowCount === 0) {
      return res.status(404).json({ erro: 'Transação não encontrada ou sem permissão.' });
    }

    const deleteQuery = 'DELETE FROM transacao WHERE id = $1';
    await db.pool.query(deleteQuery, [transacao_id]);

    return res.json({ mensagem: 'Transação deletada com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar transação:', err);
    return res.status(500).json({ erro: 'Erro interno ao deletar transação.' });
  }
});

// ====================

module.exports = router;
