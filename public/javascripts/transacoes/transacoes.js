document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');

  const btnFiltrar = document.getElementById('btnFiltrar');
  const tbody = document.getElementById('tabela-transacoes');
  const mobileContainer = document.getElementById('transacoes-mobile');

  const selectTipo = document.getElementById('tipo');
  const selectCategoria = document.getElementById('categoria');

  const categoriasReceita = ["Salário", "Investimentos", "Prêmios", "Outros"];
  const categoriasDespesa = ["Alimentação", "Transporte", "Moradia", "Saúde", "Educação", "Lazer", "Outros"];

  function popularCategorias(categorias) {
    selectCategoria.innerHTML = '<option value="">Selecione uma categoria</option>';
    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.toLowerCase();
      option.textContent = cat;
      selectCategoria.appendChild(option);
    });
  }

  selectTipo.addEventListener('change', () => {
    const tipoSelecionado = selectTipo.value.toLowerCase();
    if (tipoSelecionado === 'receita') {
      popularCategorias(categoriasReceita);
    } else if (tipoSelecionado === 'despesa') {
      popularCategorias(categoriasDespesa);
    } else {
      selectCategoria.innerHTML = '<option value="">Selecione uma categoria</option>';
    }
  });

  if (selectTipo.value) {
    selectTipo.dispatchEvent(new Event('change'));
  }

  async function buscarCliente() {
    const res = await fetch(`/cliente/dados/email/${email}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Erro ao buscar cliente');
    const data = await res.json();
    return Array.isArray(data) ? data[0] : data;
  }

  async function buscarTransacoes(clienteId, filtros = {}) {
    const params = new URLSearchParams(filtros);
    const res = await fetch(`/transacao/filtrar/cliente_id/${clienteId}?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Erro ao buscar transações');
    return await res.json();
  }

  function preencherTabela(transacoes) {
    tbody.innerHTML = '';
    mobileContainer.innerHTML = '';

    if (!Array.isArray(transacoes) || transacoes.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="6" class="text-center">Nenhuma transação encontrada.</td>';
      tbody.appendChild(tr);

      mobileContainer.innerHTML = '<p class="text-center mt-3">Nenhuma transação encontrada.</p>';
      return;
    }

    transacoes.forEach(tx => {
      // TABELA
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${tx.tipo}</td>
        <td>${tx.descricao}</td>
        <td>R$ ${Number(tx.valor).toFixed(2)}</td>
        <td>${tx.categoria}</td>
        <td>${new Date(tx.criado_em).toLocaleDateString('pt-BR')}</td>
        <td>
          <a href="/transacoes/editar/${tx.id}" class="btn btn-secondary btn-sm">Editar</a>
          <button type="button" class="btn btn-light btn-sm ms-2" onclick="deletarTransacao('${tx.id}')">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);

      // CARD MOBILE
      const card = document.createElement('div');
      card.className = 'card bg-dark text-white mb-3';
      card.innerHTML = `
        <div class="card-body">
          <p><strong>Tipo:</strong> ${tx.tipo}</p>
          <p><strong>Descrição:</strong> ${tx.descricao}</p>
          <p><strong>Valor:</strong> R$ ${Number(tx.valor).toFixed(2)}</p>
          <p><strong>Categoria:</strong> ${tx.categoria}</p>
          <p><strong>Data:</strong> ${new Date(tx.criado_em).toLocaleDateString('pt-BR')}</p>
          <div class="d-flex justify-content-center gap-2">
            <a href="/transacoes/editar/${tx.id}" class="btn btn-outline-light btn-sm">Editar</a>
            <button type="button" class="btn btn-light btn-sm" onclick="deletarTransacao('${tx.id}')">Excluir</button>
          </div>
        </div>
      `;
      mobileContainer.appendChild(card);
    });
  }

  window.buscarCliente = buscarCliente;
  window.buscarTransacoes = buscarTransacoes;
  window.preencherTabela = preencherTabela;

  (async () => {
    try {
      const cliente = await buscarCliente();
      const transacoes = await buscarTransacoes(cliente.id);
      preencherTabela(transacoes);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Erro ao carregar dados');
    }
  })();

  btnFiltrar.addEventListener('click', async () => {
    const tipo = selectTipo.value.trim().toLowerCase();
    const categoria = selectCategoria.value.trim().toLowerCase();
    const data = document.getElementById('data').value;
    const valor = document.getElementById('valor').value;

    try {
      const cliente = await buscarCliente();
      const filtros = {};
      if (tipo) filtros.tipo = tipo;
      if (categoria) filtros.categoria = categoria;
      if (data) filtros.data = data;
      if (valor) filtros.valor = valor;

      const transacoes = await buscarTransacoes(cliente.id, filtros);
      preencherTabela(transacoes);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Erro ao filtrar transações');
    }
  });
});

// GLOBAL
async function deletarTransacao(id) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Você precisa estar logado.');
    window.location.href = '/';
    return;
  }

  const confirmacao = confirm('Tem certeza que deseja excluir esta transação?');
  if (!confirmacao) return;

  try {
    const response = await fetch(`/transacao/deletar/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.erro || 'Erro ao excluir transação.');
      return;
    }

    alert(data.mensagem || 'Transação excluída com sucesso!');
    const cliente = await window.buscarCliente();
    const transacoes = await window.buscarTransacoes(cliente.id);
    window.preencherTabela(transacoes);
  } catch (err) {
    console.error(err);
    alert('Erro ao excluir transação. Verifique sua conexão.');
  }
}