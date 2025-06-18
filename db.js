const { Pool, Client } = require('pg');
require('dotenv').config();

const entradaDB = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database:  process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

const nomeDoBanco = process.env.DB_NAME;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: nomeDoBanco,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function criarBD() {

  const client = new Client(entradaDB);
  
  try {

    await client.connect();

    const res = await client.query(`SELECT 1 FROM financas_pessoais WHERE datname = $1`, [nomeDoBanco]);

    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE ${nomeDoBanco}`);
      console.log(`Banco de dados "${nomeDoBanco}" criado com sucesso.`);
    } else {
      console.log(`Banco de dados "${nomeDoBanco}" já existe.`);
    }
  } catch (err) {
    console.error('❌ Erro ao verificar/criar banco:', err);
  } finally {
    await client.end();
  }
}

async function criarTabelaBD() {

  const client = new Client(entradaDB);

  try {

    await client.connect();

    // Verifica se tabela cliente existe
    const tabCliente = await client.query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'cliente';
    `);

    if (tabCliente.rowCount === 0) {
      await client.query(`
        CREATE TABLE cliente (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          senha VARCHAR(100) NOT NULL,
          ativo BOOLEAN NOT NULL DEFAULT true,
          criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        );
      `);
      console.log('Tabela Cliente criada com sucesso.');
    } else {
      console.log('Tabela Cliente já existe.');
    }

    // Verifica se tabela transacao existe
    const tabTransacao = await client.query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'transacao';
    `);

    if (tabTransacao.rowCount === 0) {
      await client.query(`
        CREATE TABLE transacao (
          id SERIAL PRIMARY KEY,
          cliente_id INTEGER REFERENCES cliente(id),
          tipo VARCHAR(50) NOT NULL,
          descricao VARCHAR(100) NOT NULL,
          valor DECIMAL(10, 2) NOT NULL,
          categoria VARCHAR(100) NOT NULL,
          criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('Tabela Transacao criada com sucesso.');
    } else {
      console.log('Tabela Transacao já existe.');
    }

  } catch (err) {
    console.error('Erro ao verificar/criar tabela:', err);
  } finally {
    await client.end();
  }
}

async function inicializacao() {

  await criarBD();
  await criarTabelaBD();

  // Testa a conexão final
  try {
    const client = await pool.connect();
    console.log(`✅ Conectado ao banco "${nomeDoBanco}" com sucesso.`);
    client.release();
  } catch (err) {
    console.error(`❌ Erro ao conectar ao banco "${nomeDoBanco}":`, err);
  }
}

module.exports = { pool, inicializacao };