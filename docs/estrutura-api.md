# 📘 Documentação da API REST - Controle de Finanças Pessoais

## 🔹 Rotas de Cliente

| Método | Rota                              | Descrição                                                           | Protegida |
|--------|-----------------------------------|---------------------------------------------------------------------|-----------|
| GET    | `/cliente/dados`                  | 🔒 Listar **somente os dados do cliente logado**                    | ✅        |
| GET    | `/cliente/dados/email/:email`     | 🔒 Buscar cliente pelo email (útil apenas se for admin/autenticado) | ✅        |
| POST   | `/cliente/registrar`              | Registrar novo cliente                                              | ❌        |
| POST   | `/cliente/login`                  | Login e geração do token JWT                                        | ❌        |
| PUT    | `/cliente/perfil`                 | 🔒 Alterar **somente os dados do cliente logado**                   | ✅        |
| PUT    | `/cliente/desativar`              | 🔒 Desativar conta do cliente logado                                | ✅        |
| PUT    | `/cliente/reativar`               | 🔒 Reativar conta do cliente logado                                 | ✅        |

---

## 🔹 Rotas de Transações

| Método | Rota                                          | Descrição                                         | Protegida |
|--------|-----------------------------------------------|---------------------------------------------------|-----------|
| GET    | `/transacao/dados/cliente_id/:ClientId`       | 🔒 Listar todas as transações do cliente          | ✅        |
| GET    | `/transacao/dados/:id`                        | 🔒 Buscar detalhes de uma transação               | ✅        |
| POST   | `/transacao`                                  | 🔒 Criar nova transação                           | ✅        |
| PUT    | `/transacao`                                  | 🔒 Atualizar transação                            | ✅        |
| DELETE | `/transacao/:id`                              | 🔒 Deletar transação                              | ✅        |

> 💡 **Recomendação**: use `req.cliente.id` a partir do token JWT, em vez de passar `ClientId` na URL.

---

## 🔹 Rotas de Relatórios

| Método | Rota                              | Descrição                                    | Protegida |
|--------|-----------------------------------|----------------------------------------------|-----------|
| GET    | `/saldo/cliente_id/:cliente_id`   | 🔒 Retorna o saldo atual do cliente logado   | ✅        |
| GET    | `/relatorio`                      | 🔒 Total gasto/recebido por categoria        | ✅        |
| GET    | `/relatorio/download-pdf`         | 🔒 Gera PDF com resumo financeiro            | ✅        |

---

## ✅ Boas práticas REST aplicadas

- 🔐 Uso de JWT para autenticação
- ❌ Senhas nunca são retornadas, mesmo criptografadas
- 📦 JSON como padrão de entrada/saída
- 🔒 Rotas protegidas com middleware `autenticarToken`
- 🧼 `id` do cliente obtido do token em vez de passar na URL