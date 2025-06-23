const express = require('express');
const router = express.Router();
const db = require('../db');
const autenticarToken = require('../middlewares/jsonwebtoken');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { hashSenha, compararSenha } = require('../middlewares/bcrypt');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises; // Para usar promises (async/await)
const fsSync = require('fs');
const sharp = require('sharp');

// Multer

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({ storage });


//


// Todos os GET

router.get('/dados', autenticarToken, async function(req, res) {
  try {
    const vquery = "SELECT id, nome, email, senha, ativo, foto criado_em FROM cliente";
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
      SELECT id, nome, email, senha, ativo, criado_em, foto
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
// Rota de registro
router.post('/registrar', upload.single('foto'), async (req, res) => {
  let xverificacao = true;

  try {
    const { nome, email, senha, senha1 } = req.body;
    const arquivoFoto = req.file;
    const emailFormatado = email?.trim().toLowerCase();

    if (!nome || !emailFormatado || !senha || !senha1) {
      return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
    }

    if (senha !== senha1) {
      return res.status(400).json({ erro: 'As senhas não conferem.' });
    }

    let nomeNovo = 'default-avatar.jpg';
    let fotoFinal = `uploads/${nomeNovo}`;

    if (arquivoFoto) {
      const ext = path.extname(arquivoFoto.filename).toLowerCase();
      const caminhoFotoOriginal = path.join(__dirname, '../public/uploads', arquivoFoto.filename);

      nomeNovo = arquivoFoto.filename;

      if (ext === '.webp' || ext === '.avif') {
        nomeNovo = `${uuidv4()}.jpg`;
        const caminhoNovo = path.join(__dirname, '../public/uploads', nomeNovo);

        await sharp(caminhoFotoOriginal)
          .jpeg({ quality: 90 })
          .toFile(caminhoNovo);

        try {
          await new Promise(r => setTimeout(r, 100));
          await fs.unlink(caminhoFotoOriginal);
        } catch (unlinkErr) {
          console.warn('Não foi possível remover o arquivo original:', unlinkErr.message);
        }
      }

      fotoFinal = `uploads/${nomeNovo}`;
    }

    const senhaHash = await hashSenha(senha);

    const cliente = {
      id: uuidv4(),
      nome,
      email: emailFormatado,
      senha: senhaHash,
      ativo: true,
      criado_em: new Date(),
      foto: fotoFinal
    };

    const query = `
      INSERT INTO cliente (id, nome, email, senha, ativo, criado_em, foto)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      cliente.id,
      cliente.nome,
      cliente.email,
      cliente.senha,
      cliente.ativo,
      cliente.criado_em,
      cliente.foto
    ];

    const result = await db.pool.query(query, values);

    res.status(201).json({
      dados: result.rows[0],
      mensagem: 'Cadastro realizado com sucesso!',
      verificacao: xverificacao
    });

  } catch (err) {
    console.error('Erro ao registrar cliente:', err);
    xverificacao = false;
    res.status(500).json({
      erro: 'Erro interno ao registrar cliente.',
      mensagem: err.message,
      verificacao: xverificacao
    });
  }
});



router.post('/login', async function (req, res) {
  const { email, senha } = req.body;

  try {
    if (!email || !senha) {
      return res.status(400).json({ erro: 'Preencha o email e a senha.' });
    }

    const emailFormatado = email.trim().toLowerCase();

    const query = `SELECT * FROM cliente WHERE email = $1`;
    const result = await db.pool.query(query, [emailFormatado]);

    if (result.rowCount === 0) {
      return res.status(401).json({ erro: 'Email ou senha inválidos.' });
    }

    const cliente = result.rows[0];

    if (!cliente.ativo) {
      return res.status(403).json({ erro: 'Conta desativada', desativada: true });
    }

    const senhaValida = await compararSenha(senha, cliente.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha inválidos.' });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { id: cliente.id, email: cliente.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      token,
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        foto: cliente.foto
      },
      mensagem: 'Login realizado com sucesso!'
    });

  } catch (err) {
    console.error('Erro ao fazer login:', err);
    res.status(500).json({ erro: 'Erro interno no login.' });
  }
});

// ====================

// PUT

// Desativa um cliente pelo email
router.put('/desativar', autenticarToken, async (req, res) => {
  try {
    const userId = req.usuario.id; // pega o id do token

    const query = `UPDATE cliente SET ativo = false WHERE id = $1 RETURNING *`;
    const result = await db.pool.query(query, [userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }

    res.status(200).json({
      mensagem: 'Conta desativada com sucesso!'
    });

  } catch (err) {
    console.error('Erro ao desativar conta:', err);
    res.status(500).json({ erro: 'Erro interno ao desativar conta.' });
  }
});

router.put('/reativar', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ erro: 'Email é obrigatório para reativar a conta.' });
  }

  try {
    const query = `UPDATE cliente SET ativo = true WHERE email = $1 RETURNING *`;
    const result = await db.pool.query(query, [email]);

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Conta não encontrada.' });
    }

    res.status(200).json({
      mensagem: 'Conta reativada com sucesso!'
    });

  } catch (err) {
    console.error('Erro ao reativar conta:', err);
    res.status(500).json({ erro: 'Erro interno ao reativar conta.' });
  }
});

router.put('/perfil', autenticarToken, upload.single('foto'), async (req, res) => {
  
  try {
    const userId = req.usuario.id; // Do token
    const { nome, email, senha } = req.body;
    const arquivoFoto = req.file;

    if (!nome || !email) {
      return res.status(400).json({ erro: 'Nome e email são obrigatórios.' });
    }

    const clienteRes = await db.pool.query('SELECT * FROM cliente WHERE id = $1', [userId]);
    if (clienteRes.rowCount === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado.' });
    }
    const cliente = clienteRes.rows[0];

    let fotoFinal = cliente.foto; 

    if (arquivoFoto) {
      const ext = path.extname(arquivoFoto.filename).toLowerCase();
      const caminhoFotoOriginal = path.join(__dirname, '../public/uploads', arquivoFoto.filename);

      let nomeNovo = arquivoFoto.filename; 

      if (ext === '.webp' || ext === '.avif') {
        nomeNovo = `${uuidv4()}.jpg`;
        const caminhoNovo = path.join(__dirname, '../public/uploads', nomeNovo);

        await sharp(caminhoFotoOriginal)
          .jpeg({ quality: 90 })
          .toFile(caminhoNovo);

        try {
          await fs.unlink(caminhoFotoOriginal); 
        } catch (unlinkErr) {
          console.warn('Não foi possível remover o arquivo original:', unlinkErr.message);
        }
      }

      fotoFinal = `uploads/${nomeNovo}`;

      if (cliente.foto && cliente.foto !== 'uploads/default-avatar.jpg') {
        try {
          await fs.unlink(path.join(__dirname, '../public', cliente.foto));
        } catch {}
      }
    }

    let senhaHash = cliente.senha;
    if (senha && senha.trim() !== '') {
      senhaHash = await hashSenha(senha);
    }

    const query = `
      UPDATE cliente
      SET nome = $1,
          email = $2,
          senha = $3,
          foto = $4
      WHERE id = $5
      RETURNING id, nome, email, foto
    `;

    const values = [nome, email.trim().toLowerCase(), senhaHash, fotoFinal, userId];
    const updateResult = await db.pool.query(query, values);

    res.json({
      mensagem: 'Perfil atualizado com sucesso!',
      dados: updateResult.rows[0]
    });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    res.status(500).json({ erro: 'Erro interno ao atualizar perfil.' });
  }
});


// ==================

module.exports = router;
