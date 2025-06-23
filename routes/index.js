const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const https = require('https');
const db = require('../db');

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fsSync.createWriteStream(filepath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Falha ao baixar imagem. Status: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fsSync.unlink(filepath, () => reject(err));
    });
  });
}

router.get('/', async function(req, res, next) {
  try {
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    const exportsDir = path.join(__dirname, '..', 'public', 'exports');

    const defaultImageUrl = 'https://thumbs.dreamstime.com/b/%C3%ADcone-de-usu%C3%A1rio-m%C3%ADdia-social-vetor-imagem-perfil-do-avatar-padr%C3%A3o-retrato-182347582.jpg';
    const defaultImagePath = path.join(uploadsDir, 'default-avatar.jpg');

    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(exportsDir, { recursive: true });

    const imageExists = fsSync.existsSync(defaultImagePath);

    if (!imageExists) {
      try {
        console.log('Tentando baixar imagem padrão...');
        await downloadImage(defaultImageUrl, defaultImagePath);
        console.log('Imagem padrão salva em uploads.');
      } catch (downloadErr) {
        console.error('Falha ao baixar a imagem padrão:', downloadErr);
        console.log('Coloque manualmente a imagem default-avatar.jpg na pasta public/uploads para evitar esse erro.');
      }
    } else {
      console.log('Imagem padrão já existe, não precisa baixar.');
    }

    await db.inicializacao();

    res.render('index', {
      title: 'API de Controle de Finanças Pessoais',
      mensagem: 'Banco inicializado, e pastas prontas!',
      acesso: true
    });
  } catch (err) {
    console.error('Erro ao inicializar banco, criar pasta ou baixar imagem:', err);
    res.status(500).render('index', {
      title: 'Express',
      mensagem: 'Erro ao inicializar banco, criar pasta ou baixar imagem',
      acesso: false
    });
  }
});

module.exports = router;