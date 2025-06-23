# 📊 Algoritmo e Requisições – API de Controle de Finanças Pessoais

## ✅ Etapa 1: Definição do Projeto

- **📌 Nome do Projeto:** API de Controle de Finanças Pessoais  
- **🛠 Tecnologias Utilizadas:**  
  - **Backend:** Node.js com Express  
  - **Banco de Dados:** PostgreSQL  
  - **Autenticação:** JWT + bcrypt  
  - **Outros:** PDFKit (relatórios), Multer (upload de imagens), Sharp (tratamento de imagem), Chart.js (gráficos)

- **🎯 Objetivo:**  
  Desenvolver uma API RESTful para que usuários possam:
  - Cadastrar receitas e despesas
  - Organizar transações por tipo e categoria
  - Visualizar o saldo total e gerar relatórios
  - Proteger dados com autenticação via JWT

---

## 🧱 Etapa 2: Preparação do Ambiente

### 🔹 1. Inicialização do Projeto

```bash
npm init -y
npm install express
npm start
```

> 💡 Recomenda-se criar o arquivo `app.js` logo após a instalação do Express para iniciar o servidor.

---

### 🔹 2. Instalação dos Pacotes Essenciais

```bash
npm install bcrypt chart.js cookie-parser debug dotenv express http-errors install jade jsonwebtoken morgan multer npm pdfkit pg pug sharp uuid
```

> 💡 Utilize `dotenv` para gerenciar variáveis de ambiente como porta, conexão com banco e segredo do JWT.

---

### 🔹 3. Estrutura Inicial do Projeto

```
/docs
  algoritmo-requisicoes.md
  estrutura-api.md
  estrutura-dados.md
  estrutura-pagina.md

/middlewares
  bcrypt.js
  jsonwebtoken.js

/public
  (arquivos públicos como imagens e CSS)

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