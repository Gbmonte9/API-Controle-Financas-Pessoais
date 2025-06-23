
# 📊 Algoritmo e Requisições

## Etapa 1: Definição do Projeto

- **Nome do Projeto:** API de Controle de Finanças Pessoais  
- **Tecnologias principais:** Node.js (Express), PostgreSQL  
- **Objetivo:** Permitir o registro de receitas e despesas com tipo, categorias, datas e valores, além de calcular o saldo total do usuário.

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
npm install "bcrypt": "^6.0.0",
        "chart.js": "^4.5.0",
        "cookie-parser": "~1.4.4",
        "debug": "~2.6.9",
        "dotenv": "^16.5.0",
        "express": "~4.16.1",
        "http-errors": "~1.6.3",
        "install": "^0.13.0",
        "jade": "~1.11.0",
        "jsonwebtoken": "^9.0.2",
        "morgan": "~1.9.1",
        "multer": "^2.0.1",
        "npm": "^11.4.2",
        "pdfkit": "^0.17.1",
        "pg": "^8.16.0",
        "pug": "^3.0.3",
        "sharp": "^0.34.2",
        "uuid": "^11.1.0"
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

