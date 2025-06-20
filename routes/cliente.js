const express = require('express');
const router = express.Router();
const db = require('../db');
const autenticarToken = require('../middlewares/jsonwebtoken');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { hashSenha, compararSenha } = require('../middlewares/bcrypt');
require('dotenv').config();

// Todos os GET

router.get('/dados', autenticarToken, async function(req, res) {
  try {
    const vquery = "SELECT id, nome, email, senha, ativo, criado_em FROM cliente";
    const vcliente = await db.pool.query(vquery);

    res.json(vcliente.rows);  
  } catch (err) {
    console.error('Erro ao buscar clientes:', err);
    res.status(500).json({ erro: 'Erro ao buscar dados' });
  }
});

router.get('/dados/email/:Email', autenticarToken, async (req, res) => {
  try {
    const email = req.params.Email.toLowerCase();

    const query = `
      SELECT id, nome, email, senha, ativo, criado_em
      FROM cliente
      WHERE LOWER(email) LIKE $1
    `;

    const values = [`%${email}%`]; 

    const result = await db.pool.query(query, values);

    res.json(result.rows); 
  } catch (err) {
    console.error('Erro ao buscar clientes:', err);
    res.status(500).json({ erro: 'Erro ao buscar dados' });
  }
});

// ===============================

// Todos os POST

router.post('/registrar', async function(req, res, next) {
  const { nome, email, senha, senha1 } = req.body;

  if (senha !== senha1) {
    return res.status(400).json({ erro: 'As senhas não conferem' });
  }

  try {
  
    const senhaHash = await hashSenha(senha);

    const cliente = {
      id: uuidv4(),
      nome,
      email,
      senha: senhaHash,  
      ativo: true,
      criado_em: new Date(),
    };

    const query = `
      INSERT INTO cliente (id, nome, email, senha, ativo, criado_em)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      cliente.id,
      cliente.nome,
      cliente.email,
      cliente.senha,
      cliente.ativo,
      cliente.criado_em,
    ];

    const result = await db.pool.query(query, values);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao registrar cliente:', err);
    res.status(500).json({ erro: 'Erro ao registrar cliente' });
  }
  
});

router.post('/login', async function (req, res) {
  const { email, senha } = req.body;

  try {
   
    const query = `SELECT * FROM cliente WHERE email = $1`;
    const result = await db.pool.query(query, [email]);

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const cliente = result.rows[0];

    const senhaValida = await compararSenha(senha, cliente.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha incorreta' });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { id: cliente.id, email: cliente.email },
      process.env.JWT_SECRET,                   
      { expiresIn: '1h' }                      
    );

    res.json({ token });

  } catch (err) {
    console.error('Erro ao fazer login:', err);
    res.status(500).json({ erro: 'Erro interno no login' });
  }
});

// ====================

// PUT

router.put('/perfil', autenticarToken, async function (req, res) {
  const { nome, email, senha } = req.body;

  try {
    const clienteId = req.usuario.id;

    const query = `SELECT * FROM cliente WHERE id = $1`;
    const result = await db.pool.query(query, [clienteId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const cliente = result.rows[0];

    let senhaHasheada = cliente.senha;
    if (senha && senha.trim() !== '') {
      senhaHasheada = await hashSenha(senha); 
    }

    const updateQuery = `
      UPDATE cliente 
      SET nome = $1, email = $2, senha = $3
      WHERE id = $4
      RETURNING id, nome, email, ativo, criado_em
    `;

    const updateResult = await db.pool.query(updateQuery, [
      nome,
      email,
      senhaHasheada,
      clienteId
    ]);

    res.json({
      mensagem: 'Perfil atualizado com sucesso',
      cliente: updateResult.rows[0]
    });

  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    res.status(500).json({ erro: 'Erro interno ao atualizar perfil' });
  }

});

// ==================

module.exports = router;
