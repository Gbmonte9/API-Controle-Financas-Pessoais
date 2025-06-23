document.addEventListener('DOMContentLoaded', async () => {
  const toggler = document.querySelector('.navbar-toggler');
  toggler?.addEventListener('click', () => {
    const nav = document.getElementById('navbarNav');
    if (nav) nav.classList.toggle('show');
  });

  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');
  const id = localStorage.getItem('id');

  if (!token) {
    alert('Você precisa estar logado.');
    window.location.href = '/';
    return;
  }

  try {
    const responseCliente = await fetch(`/cliente/dados/email/${email}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dataCliente = await responseCliente.json();

    if (!responseCliente.ok) {
      alert(dataCliente.erro || 'Erro ao buscar dados do cliente');
      return;
    }

    const cliente = Array.isArray(dataCliente) ? dataCliente[0] : dataCliente;

    const dadosClienteEl = document.getElementById('dados-cliente');
    if (dadosClienteEl) dadosClienteEl.textContent = `Bem-vindo, ${cliente.nome}`;

    const nomeUsuarioEl = document.getElementById('nome-usuario');
    if (nomeUsuarioEl) nomeUsuarioEl.textContent = cliente.nome;

    const fotoClienteEl = document.getElementById('fotoCliente');
    if (fotoClienteEl) {
      fotoClienteEl.src = cliente.foto || '/uploads/default-avatar.jpg';
    }

    const responseSaldo = await fetch(`/relatorio/saldo/cliente_id/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dataSaldo = await responseSaldo.json();

    if (!responseSaldo.ok) {
      alert(dataSaldo.erro || 'Erro ao buscar saldo');
      return;
    }

    const saldoEl = document.getElementById('saldo-valor');
    if (saldoEl) {
      saldoEl.textContent = `R$ ${Number(dataSaldo.saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }

    const receitaEl = document.getElementById('receita-valor');
    if (receitaEl) {
      receitaEl.textContent = `R$ ${Number(dataSaldo.receita).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }

    const despesaEl = document.getElementById('despesa-valor');
    if (despesaEl) {
      despesaEl.textContent = `R$ ${Number(dataSaldo.despesa).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }

  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    alert('Erro de conexão com o servidor');
  }
  
});