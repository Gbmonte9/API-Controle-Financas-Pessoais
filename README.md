# 💰 API de Controle de Finanças Pessoais

📝 **Descrição**  
Projeto desafiador focado no controle financeiro pessoal com autenticação JWT, filtros dinâmicos e geração de relatórios visuais. Ideal para treinar rotas REST, integração com banco PostgreSQL e lógica de negócios reais.

---

## 🚀 Funcionalidades

- Cadastro de **receitas** e **despesas**
- Filtros por **tipo**, **categoria**, **data** e **valor**
- **Cálculo automático de saldo**
- Suporte a **categorias** como alimentação, saúde, transporte etc.
- Geração de relatórios:
  - 📊 Gráfico de pizza
  - 📋 Tabela de registros
  - 📈 Gráfico de colunas
  - 📄 Exportação em PDF
- 🔐 Autenticação com JWT (acesso apenas aos dados do usuário logado)

---

## 🧠 Destaques Técnicos

Excelente para demonstrar:

- 🧩 Lógica de negócio bem definida
- 🔗 Uso de *joins* em consultas PostgreSQL
- 📆 Manipulação de datas
- 🔒 Boas práticas de segurança com bcrypt e JWT

---

## 📦 Tecnologias Utilizadas

- Node.js
- Express
- PostgreSQL
- JWT (`jsonwebtoken`)
- Bcrypt
- Multer + Sharp
- Chart.js
- PDFKit
- dotenv
- uuid

---

## 📁 Estrutura do Projeto

```
/routes/
  /app/
    dashboard.js
    login.js
    perfil.js
    registrar.js
    relatorios.js 
    transacoes.js
  cliente.js
  relatorio.js
  transacao.js
  index.js

/views/
  dashboard.pug
  login.pug
  perfil.pug
  registrar.pug
  relatorios.pug 
  transacoes.pug

/middlewares/
  bcrypt.js
  jsonwebtoken.js

/public/
  (arquivos estáticos como imagens e CSS)

.env
.gitignore
app.js
db.js
package.json
README.md
```

---

## 🔐 Segurança com `.env`

O projeto utiliza `dotenv` para proteger dados sensíveis:

```env
  DB_USER=postgres
  DB_PASSWORD=1234
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=financas_pessoais

  JWT_SECRET=5e7c1f4b3a7d490e9afc242a9e93e0f7c2b9a91d1f8d44a7b39a3d0a8c12f9d6
```

---

## 🧪 Rotas da API

### 🔸 Rotas de Cliente

| Método | Rota                              | Descrição                                                           | Protegida |
|--------|-----------------------------------|----------------------------------------------------------------------|-----------|
| GET    | `/cliente/dados`                  | 🔒 Retorna os dados do cliente logado                                | ✅        |
| GET    | `/cliente/dados/email/:email`     | 🔒 Busca cliente pelo email (admin ou autorizado)                    | ✅        |
| POST   | `/cliente/registrar`              | Registra novo cliente                                                | ❌        |
| POST   | `/cliente/login`                  | Login com geração de token JWT                                       | ❌        |
| PUT    | `/cliente/perfil`                 | 🔒 Atualiza os dados do próprio perfil                                | ✅        |
| PUT    | `/cliente/desativar`              | 🔒 Desativa a conta do cliente logado                                 | ✅        |
| PUT    | `/cliente/reativar`               | 🔒 Reativa a conta do cliente logado                                  | ✅        |

---

### 🔸 Rotas de Transações

| Método | Rota                                | Descrição                                          | Protegida |
|--------|-------------------------------------|----------------------------------------------------|-----------|
| GET    | `/transacao/dados/cliente_id/:id`   | 🔒 Lista todas as transações do cliente            | ✅        |
| GET    | `/transacao/dados/:id`              | 🔒 Busca uma transação específica                  | ✅        |
| POST   | `/transacao`                        | 🔒 Cria uma nova transação                         | ✅        |
| PUT    | `/transacao`                        | 🔒 Atualiza uma transação existente                | ✅        |
| DELETE | `/transacao/:id`                    | 🔒 Remove uma transação                            | ✅        |

---

### 🔸 Rotas de Relatórios

| Método | Rota                           | Descrição                                | Protegida |
|--------|--------------------------------|------------------------------------------|-----------|
| GET    | `/saldo/cliente_id/:id`        | 🔒 Retorna o saldo do cliente logado      | ✅        |
| GET    | `/relatorio`                   | 🔒 Gera relatório com total por categoria | ✅        |
| GET    | `/relatorio/download-pdf`      | 🔒 Gera e baixa relatório em PDF          | ✅        |

---

## 🌐 Estrutura de Páginas Web (Frontend)

### 1. Página Inicial (Landing Page)
- **URL:** `/`
- **Função:** Apresentação do sistema com opções de login e registro
- **Acesso:** Público

### 2. Página de Registro
- **URL:** `/registrar`
- **Campos:** Nome, E-mail, Senha, Confirmação de senha, Upload de foto  
- **Requisição:** `POST /clientes/registrar`

### 3. Página de Login
- **URL:** `/login`
- **Campos:** E-mail, Senha  
- **Requisição:** `POST /clientes/login`  
- **Token armazenado:** `localStorage`

### 4. Dashboard (Resumo)
- **URL:** `/dashboard`
- **Exibe:** Saldo atual, total de receitas e despesas  
- **Dados via:** `GET /relatorios/saldo`  
- **Proteção:** JWT

### 5. Página de Transações
- **URL:** `/transacoes`
- **Função:** Lista e filtra transações  
- **Operações:** `GET`, `POST`, `PUT`, `DELETE`

### 6. Nova Transação
- **URL:** `/transacoes/nova`
- **Função:** Formulário para adicionar nova receita/despesa

### 7. Editar Transação
- **URL:** `/transacoes/editar/:id`
- **Função:** Formulário pré-preenchido para editar

### 8. Relatórios Detalhados
- **URL:** `/relatorios`
- **Exibe:** Tabela por categoria, gráficos (pizza/colunas) e botão para PDF

### 9. Perfil do Cliente
- **URL:** `/perfil`
- **Exibe:** Nome, E-mail, Foto, Data de registro  
- **Ações:** Editar perfil, alterar senha, desativar conta

---

## 📦 Instalação e Execução

```bash
git clone https://github.com/Gbmonte9/api-financas-pessoais.git
cd api-financas-pessoais
npm install
```

Configure seu `.env` e inicie o servidor:

```bash
npm start
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

✍️ **Autor**  
**Gabriel Monte** – [LinkedIn](https://www.linkedin.com/in/gabriel-rodrigues-mt)  
Estudante de Engenharia de Software na Estácio & Desenvolvedor Fullstack na Step Computer Academy