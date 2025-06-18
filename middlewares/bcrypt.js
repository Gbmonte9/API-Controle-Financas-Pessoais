const bcrypt = require('bcrypt');

const saltRounds = 10; 

async function hashSenha(senha) {
  return await bcrypt.hash(senha, saltRounds);
}

async function compararSenha(senhaTexto, hash) {
  return await bcrypt.compare(senhaTexto, hash);
}

module.exports = {
  hashSenha,
  compararSenha,
};