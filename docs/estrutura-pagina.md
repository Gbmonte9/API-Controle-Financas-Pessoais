
# 🌐 Estrutura de Páginas Web (Frontend)

## 1. Página Inicial (Landing Page)
- **URL:** `/`
- **Função:** Explicação rápida do app, botão de entrar ou registrar.
- **Visível:** Pública (sem login)

## 2. Página de Registro
- **URL:** `/registrar`
- **Formulário com:** nome, e-mail, senha
- **Envia POST para:** `/clientes/registrar`

## 3. Página de Login
- **URL:** `/login`
- **Formulário com:** e-mail e senha
- **Envia POST para:** `/clientes/login`
- **Armazena o token JWT:** localStorage ou cookie

## 4. Dashboard
- **URL:** `/dashboard`
- **Mostra:** saldo atual, total de receitas, total de despesas
- **Busca dados via:** `/relatorios/saldo`
- **Protegida com token JWT**

## 5. Minhas Transações
- **URL:** `/transacoes`
- **Mostra lista de receitas/despesas**
- **Permite filtrar por:** categoria, data, valor
- **CRUD usando:**
  - `GET /transacoes`
  - `POST /transacoes`
  - `PUT /transacoes/:id`
  - `DELETE /transacoes/:id`

## 6. Nova Transação
- **URL:** `/transacoes/nova`
- **Formulário para inserir receita ou despesa**

## 7. Editar Transação
- **URL:** `/transacoes/editar/:id`
- **Carrega dados existentes para edição**

## 8. Relatórios Detalhados
- **URL:** `/relatorios`
- **Permite o usuário:**
  - Selecionar mês ou período
  - Ver gráfico por categoria
  - Ver tabela resumida

## 9. Perfil do Cliente
- **URL:** `/perfil`
- **Dados:** nome, email, botão de editar
