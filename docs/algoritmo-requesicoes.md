
# 📊 Algoritmo e Requisições

## Etapa 1: Definição do Projeto

- **Nome do Projeto:** API de Controle de Finanças Pessoais  
- **Tecnologias principais:** Node.js (Express), PostgreSQL  
- **Objetivo:** Permitir o registro de receitas e despesas com categorias, datas e valores, além de calcular o saldo total do usuário.

---

## Etapa 2: Preparação do Ambiente

### 1. Inicialização do projeto

```bash
npm init -y
npm install express
npm start
```

### 2. Instalação de pacotes

```bash
npm install express pg dotenv uuid bcrypt jsonwebtoken
```

### 3. Estrutura inicial de pastas

```plaintext
/docs
  algoritmo-requisicoes.md
  estrutura-api.md
  estrutura-dados.md
  estrutura-pagina.md

/middlewares
  bcrypt.js
  jsonwebtoken.js

/public

/routes
  /app
    dashboard.js
    login.js
    perfil.js
    registrar.js
    relatorios.js 
    transacoes.js
  cliente.js
  index.js
  relatorio.js
  transacao.js
  users.js

/views
  dashboard.pug
  login.pug
  perfil.pug
  registrar.pug
  relatorios.pug 
  transacoes.pug

.env
.gitignore
app.js
db.js
package-lock.json
package.json
README.md
```

