# 🌐 Estrutura de Páginas Web (Frontend)

## 1. Página Inicial (Landing Page)
- **URL:** `/`
- **Função:** Apresenta rapidamente o aplicativo, com botões para login ou registro.
- **Acesso:** Público (sem autenticação)

## 2. Página de Registro
- **URL:** `/registrar`
- **Formulário com campos:** Nome, E-mail, Senha, Confirmação de senha, Upload de foto (opcional)
- **Envia dados via:** `POST /clientes/registrar`

## 3. Página de Login
- **URL:** `/login`
- **Formulário com campos:** E-mail e Senha
- **Requisição:** `POST /clientes/login`
- **Armazena:** Token JWT no `localStorage`

## 4. Dashboard (Resumo)
- **URL:** `/dashboard`
- **Exibe:** Saldo atual, total de receitas, total de despesas
- **Dados via:** `GET /relatorios/saldo`
- **Acesso protegido:** Requer token JWT

## 5. Página de Transações
- **URL:** `/transacoes`
- **Função:** Listar transações do usuário (receitas e despesas)
- **Filtros disponíveis:** Tipo, Categoria, Valor, Data
- **Operações suportadas:**
  - `GET /transacoes`
  - `POST /transacoes`
  - `PUT /transacoes/:id`
  - `DELETE /transacoes/:id`

## 6. Nova Transação
- **URL:** `/transacoes/nova`
- **Descrição:** Formulário para adicionar nova receita ou despesa
- **Envio via:** `POST /transacoes`

## 7. Editar Transação
- **URL:** `/transacoes/editar/:id`
- **Descrição:** Carrega dados da transação e permite atualização
- **Envio via:** `PUT /transacoes/:id`

## 8. Relatórios Detalhados
- **URL:** `/relatorios`
- **Funcionalidades:**
  - Visualização de saldo total, receitas e despesas
  - Tabela com totais por categoria:
    - Total de receitas por categoria
    - Total de despesas por categoria
  - Gráfico (pizza ou barras) com distribuição das despesas
  - Download dos dados em PDF

## 9. Perfil do Cliente
- **URL:** `/perfil`
- **Exibe:** Nome, E-mail, Foto, Data de registro
- **Ações disponíveis:**
  - Editar dados (nome, senha, foto)
  - Desativar a conta