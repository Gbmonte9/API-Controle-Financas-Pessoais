document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('token');
  const message = document.getElementById('message');
  const nomeInput = document.getElementById('nome');
  const emailInput = document.getElementById('email');
  const senhaInput = document.getElementById('senha');
  const senha1Input = document.getElementById('senha1');
  const fotoInput = document.getElementById('foto');
  const btnEditar = document.getElementById('btnEditarCliente');

  if (!token) {
    alert('Você precisa estar logado.');
    window.location.href = '/';
    return;
  }

  fetch('/perfil/api/cliente/perfil', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(async response => {
    if (!response.ok) {
      alert('Falha ao carregar os dados do perfil. Faça login novamente.');
      window.location.href = '/';
      return;
    }
    const data = await response.json();
    if (data.nome) nomeInput.value = data.nome;
    if (data.email) emailInput.value = data.email;
  })
  .catch(err => {
    console.error(err);
    alert('Erro na conexão. Faça login novamente.');
    window.location.href = '/';
  });

  btnEditar.addEventListener('click', async (e) => {
    e.preventDefault();

    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const senha = senhaInput.value;
    const senha1 = senha1Input.value;
    const foto = fotoInput.files[0];

    message.textContent = '';
    message.className = '';

    if ((senha || senha1) && senha !== senha1) {
      message.textContent = 'As senhas não coincidem.';
      message.className = 'alert alert-danger mt-3';
      return;
    }

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('email', email);
    if (senha) formData.append('senha', senha);
    if (foto) formData.append('foto', foto);

    try {
      const response = await fetch('/cliente/perfil', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        message.textContent = data.erro || 'Erro ao atualizar perfil';
        message.className = 'alert bg-dark border border-white text-white mt-3';
        return;
      }

      message.textContent = data.mensagem || 'Perfil atualizado com sucesso!';
      message.className = 'alert bg-dark border border-white text-white mt-3';

      if (data.dados && data.dados.email) {
        localStorage.setItem('email', data.dados.email);
      }

      setTimeout(() => {
        location.reload();
      }, 2000);

    } catch (err) {
      console.error(err);
      message.textContent = 'Erro de conexão com o servidor';
      message.className = 'alert bg-dark border border-white text-white mt-3';
    }
  });
});