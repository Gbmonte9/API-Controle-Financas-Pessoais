document.addEventListener('DOMContentLoaded', () => {
  const btnEntrar = document.getElementById('btnEntrar');
  const message = document.getElementById('message');

  btnEntrar.addEventListener('click', (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();

    message.textContent = '';
    message.className = '';

    if (!email || !senha) {
      message.textContent = 'Preencha o email e a senha.';
      message.className = 'alert bg-danger text-white border border-white mt-3';
      return;
    }

    fetch('/cliente/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, senha })
    })
      .then(response => response.json().then(data => ({ status: response.status, data })))
      .then(({ status, data }) => {
        if (data.desativada) {
          const confirmar = confirm('Sua conta está desativada. Deseja reativá-la?');

          if (confirmar) {
            fetch('/cliente/reativar', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email })
            })
              .then(res => res.json())
              .then(result => {
                if (result.mensagem) {
                  message.textContent = 'Conta reativada com sucesso! Faça login novamente.';
                  message.className = 'alert bg-dark border border-white text-white mt-3';
                } else {
                  message.textContent = result.erro || 'Erro ao reativar conta.';
                  message.className = 'alert bg-dark border border-white text-white mt-3';
                }
              })
              .catch(err => {
                console.error(err);
                message.textContent = 'Erro ao tentar reativar a conta.';
                message.className = 'alert bg-dark border border-white text-white mt-3';
              });
          }

          return;
        }

        if (status !== 200) {
          message.textContent = data.erro || 'Email ou senha inválidos.';
          message.className = 'alert bg-dark border border-white text-white mt-3';
          return;
        }

        const payload = JSON.parse(atob(data.token.split('.')[1]));
        localStorage.setItem('token', data.token);
        localStorage.setItem('id', payload.id);
        localStorage.setItem('email', payload.email);

        message.textContent = data.mensagem || 'Login realizado com sucesso!';
        message.className = 'alert bg-dark border border-white text-white mt-3';

        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      })
      .catch(error => {
        console.error(error);
        message.textContent = 'Erro ao conectar com o servidor.';
        message.className = 'alert bg-dark border border-white text-white mt-3';
      });
  });
});