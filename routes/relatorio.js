const express = require('express');
const router = express.Router();
const db = require('../db');
const autenticarToken = require('../middlewares/jsonwebtoken');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');

router.get('/saldo/cliente_id/:Cliente_id', autenticarToken, async function(req, res) {
  const clienteId = req.params.Cliente_id;

  try {
    const query = `
      SELECT tipo, valor
      FROM transacao
      WHERE cliente_id = $1
    `;

    const result = await db.pool.query(query, [clienteId]);

    let totalReceitas = 0;
    let totalDespesas = 0;

    result.rows.forEach(tx => {
      if (tx.tipo === 'receita') {
        totalReceitas += parseFloat(tx.valor);
      } else if (tx.tipo === 'despesa') {
        totalDespesas += parseFloat(tx.valor);
      }
    });

    const saldo = totalReceitas - totalDespesas;

    res.json({
      cliente_id: clienteId,
      saldo: saldo.toFixed(2),
      receita: totalReceitas.toFixed(2),
      despesa: totalDespesas.toFixed(2)
    });

  } catch (err) {
    console.error('Erro ao calcular saldo:', err);
    res.status(500).json({ erro: 'Erro ao calcular saldo' });
  }
});

router.get('/', autenticarToken, async function(req, res) {
  const clienteId = req.usuario.id;

  try {
    const queryCategoria = `
      SELECT categoria, tipo, SUM(valor) AS total
      FROM transacao
      WHERE cliente_id = $1
      GROUP BY categoria, tipo
      ORDER BY categoria
    `;
    const resultCategoria = await db.pool.query(queryCategoria, [clienteId]);

    const saldoQuery = `
      SELECT tipo, valor FROM transacao WHERE cliente_id = $1
    `;
    const saldoResult = await db.pool.query(saldoQuery, [clienteId]);

    let totalReceitas = 0;
    let totalDespesas = 0;

    saldoResult.rows.forEach(tx => {
      if (tx.tipo === 'receita') {
        totalReceitas += parseFloat(tx.valor);
      } else if (tx.tipo === 'despesa') {
        totalDespesas += parseFloat(tx.valor);
      }
    });

    const saldo = totalReceitas - totalDespesas;

    const totalTransacoesQuery = `
      SELECT COUNT(*) AS total FROM transacao WHERE cliente_id = $1
    `;
    const totalTransacoesResult = await db.pool.query(totalTransacoesQuery, [clienteId]);
    const totalTransacoes = parseInt(totalTransacoesResult.rows[0].total, 10);

    const maiorReceitaQuery = `
      SELECT descricao, valor FROM transacao 
      WHERE cliente_id = $1 AND tipo = 'receita' 
      ORDER BY valor DESC LIMIT 1
    `;
    const maiorReceitaResult = await db.pool.query(maiorReceitaQuery, [clienteId]);
    const maiorReceita = maiorReceitaResult.rows.length > 0 ? maiorReceitaResult.rows[0] : null;

    const maiorDespesaQuery = `
      SELECT descricao, valor FROM transacao 
      WHERE cliente_id = $1 AND tipo = 'despesa' 
      ORDER BY valor DESC LIMIT 1
    `;
    const maiorDespesaResult = await db.pool.query(maiorDespesaQuery, [clienteId]);
    const maiorDespesa = maiorDespesaResult.rows.length > 0 ? maiorDespesaResult.rows[0] : null;

    res.json({
      resumoPorCategoria: resultCategoria.rows,
      receita: totalReceitas.toFixed(2),
      despesa: totalDespesas.toFixed(2),
      saldo: saldo.toFixed(2),
      totalTransacoes,
      maiorReceita,
      maiorDespesa
    });

  } catch (err) {
    console.error('Erro ao gerar relatório:', err);
    res.status(500).json({ erro: 'Erro ao gerar relatório' });
  }
});

router.get('/download-pdf', autenticarToken, async (req, res) => {
  const clienteId = req.usuario.id;

  try {
    const clienteData = await db.pool.query(
      'SELECT nome, email, foto FROM cliente WHERE id = $1',
      [clienteId]
    );
    const cliente = clienteData.rows[0];

    const caminhoRelativo = cliente.foto || 'default-avatar.jpg';
    const caminhoFotoAbsoluto = path.join(UPLOAD_DIR, path.basename(caminhoRelativo));

    const extensoesValidas = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(caminhoFotoAbsoluto).toLowerCase();
    const imagemExiste = fs.existsSync(caminhoFotoAbsoluto);
    const podeUsarImagem = imagemExiste && extensoesValidas.includes(ext);

    console.log('Caminho da imagem:', caminhoFotoAbsoluto);
    console.log('Imagem existe?', imagemExiste);
    console.log('Extensão válida?', extensoesValidas.includes(ext));

    const transacoes = await db.pool.query(`
      SELECT tipo, valor, descricao, categoria
      FROM transacao
      WHERE cliente_id = $1
    `, [clienteId]);

    let totalReceitas = 0;
    let totalDespesas = 0;
    let maiorReceita = { descricao: 'Nenhuma', valor: 0 };
    let maiorDespesa = { descricao: 'Nenhuma', valor: 0 };
    const resumoPorCategoria = {};

    transacoes.rows.forEach(tx => {
      const valor = parseFloat(tx.valor);
      if (tx.tipo === 'receita') {
        totalReceitas += valor;
        if (valor > maiorReceita.valor) maiorReceita = { descricao: tx.descricao || 'Sem descrição', valor };
      } else if (tx.tipo === 'despesa') {
        totalDespesas += valor;
        if (valor > maiorDespesa.valor) maiorDespesa = { descricao: tx.descricao || 'Sem descrição', valor };
      }

      const categoria = tx.categoria || 'Outros';
      if (!resumoPorCategoria[categoria]) {
        resumoPorCategoria[categoria] = { tipo: tx.tipo, total: 0 };
      }
      resumoPorCategoria[categoria].total += valor;
    });

    const saldo = totalReceitas - totalDespesas;

    res.setHeader('Content-Disposition', `attachment; filename=relatorio-${clienteId}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    if (podeUsarImagem) {
      try {
        doc.image(caminhoFotoAbsoluto, 40, 40, { width: 80 });
      } catch (erroImagem) {
        console.warn('Erro ao carregar imagem:', erroImagem.message);
      }
    } else {
      console.warn('Imagem não será usada.');
    }

    doc.fontSize(14).text(`Nome: ${cliente.nome}`, 140, 40);
    doc.text(`Email: ${cliente.email}`, 140);
    doc.moveDown(2);

    doc.fontSize(20).text('Relatório Financeiro', { align: 'center' }).moveDown(1.5);

    doc.fontSize(14).text('Receitas Totais');
    doc.fontSize(12).text(`R$ ${totalReceitas.toFixed(2)}`).moveDown(0.7);

    doc.fontSize(14).text('Despesas Totais');
    doc.fontSize(12).text(`R$ ${totalDespesas.toFixed(2)}`).moveDown(0.7);

    doc.fontSize(14).text('Saldo Final');
    doc.fontSize(12).text(`R$ ${saldo.toFixed(2)}`).moveDown(1.5);

    doc.fontSize(14).text('Maior Receita');
    doc.fontSize(12).text(maiorReceita.descricao);
    doc.text(`R$ ${maiorReceita.valor.toFixed(2)}`).moveDown(1);

    doc.fontSize(14).text('Maior Despesa');
    doc.fontSize(12).text(maiorDespesa.descricao);
    doc.text(`R$ ${maiorDespesa.valor.toFixed(2)}`).moveDown(1.5);

    doc.fontSize(14).text('Resumo por Categoria').moveDown(0.5);
    doc.font('Helvetica-Bold');
    doc.text('Categoria', 50);
    doc.text('Tipo', 250);
    doc.text('Valor Total', 400);
    doc.font('Helvetica').moveDown(0.5);

    for (const [categoria, dados] of Object.entries(resumoPorCategoria)) {
      doc.text(categoria, 50);
      doc.text(dados.tipo, 250);
      doc.text(`R$ ${dados.total.toFixed(2)}`, 400);
      doc.moveDown(0.5);
    }

    doc.end();
  } catch (err) {
    console.error('Erro ao gerar PDF:', err);
    if (!res.headersSent) {
      res.status(500).json({ erro: 'Erro ao gerar PDF' });
    }
  }
});

module.exports = router;
