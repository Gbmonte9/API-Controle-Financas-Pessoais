document.addEventListener('DOMContentLoaded', () => {
  const btnDesativar = document.getElementById('btnDesativarConta');
  const message = document.getElementById('message');
  const token = localStorage.getItem('token');

  if (!token) {
    alert('Você precisa estar logado.');
    window.location.href = '/';
    return;
  }

  btnDesativar.addEventListener('click', async (e) => {
    e.preventDefault();

    const confirmar = confirm('Tem certeza que deseja desativar sua conta? Essa ação pode ser reversível.');

    if (!confirmar) return;

    try {
      const response = await fetch('/cliente/desativar', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        message.textContent = data.erro || 'Erro ao desativar a conta.';
        message.className = 'alert bg-dark border border-white text-white mt-3';
        return;
      }

      message.textContent = data.mensagem || 'Conta desativada com sucesso.';
      message.className = 'alert bg-dark border border-white text-white mt-3';

      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/';
      }, 2000);

    } catch (error) {
      console.error(error);
      message.textContent = 'Erro ao conectar com o servidor.';
      message.className = 'alert bg-dark border border-white text-white mt-3';
    }
  });
});