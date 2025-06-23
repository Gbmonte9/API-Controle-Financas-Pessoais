document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form[action="/cliente/registrar"]');
  const message = document.getElementById('message');
  console.log("Estamos enviando pelo javascript");

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const formData = new FormData(form);

    try {
      const response = await fetch('/cliente/registrar', {
        method: 'POST',
        body: formData 
      });

      const data = await response.json();

      if (response.ok) {
        message.textContent = data.mensagem || 'Cadastro realizado com sucesso!';
        message.className = 'alert bg-dark border border-white text-white mt-3';
        form.reset(); 
      } else {
        message.textContent = data.erro || 'Erro ao cadastrar.';
        message.className = 'alert bg-dark border border-white text-white mt-3';
      }

    } catch (error) {
      console.error(error);
      message.textContent = 'Erro ao conectar com o servidor.';
      message.className = 'alert bg-dark border border-white text-white mt-3';
    }
  });
});