document.addEventListener('DOMContentLoaded', function () {
    const btnCadastrar = document.getElementById('btnCadastrarTransacao');
    const message = document.getElementById('message');
    const tipoSelect = document.getElementById('tipo');
    const categoriaSelect = document.getElementById('categoria');

    const categoriasReceita = [
        "Salário",
        "Investimentos",
        "Prêmios",
        "Outros"
    ];

    const categoriasDespesa = [
        "Alimentação",
        "Transporte",
        "Moradia",
        "Saúde",
        "Educação",
        "Lazer",
        "Outros"
    ];

    function popularCategorias(opcoes) {
        categoriaSelect.innerHTML = '<option value="" disabled selected>Selecione a categoria</option>';
        opcoes.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.toLowerCase();
            option.textContent = cat;
            categoriaSelect.appendChild(option);
        });
    }

    tipoSelect.addEventListener('change', () => {
        if (tipoSelect.value === 'receita') {
            popularCategorias(categoriasReceita);
        } else if (tipoSelect.value === 'despesa') {
            popularCategorias(categoriasDespesa);
        } else {
            categoriaSelect.innerHTML = '<option value="" disabled selected>Selecione a categoria</option>';
        }
    });

    btnCadastrar.addEventListener('click', function () {
        const tipo = document.getElementById('tipo');
        const descricao = document.getElementById('descricao');
        const valor = document.getElementById('valor');
        const categoria = document.getElementById('categoria');
        const token = localStorage.getItem('token');
        const message = document.getElementById('message'); 

        fetch('/transacao', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
            tipo: tipo.value,
            descricao: descricao.value,
            valor: valor.value,
            categoria: categoria.value
            })
        })
        .then(response => response.json().then(data => ({ ok: response.ok, data })))
        .then(({ ok, data }) => {
        if (!ok) {
            message.textContent = data.mensagem || 'Error no servidor';
            message.classList.add('alert', 'bg-dark', 'border', 'border-white', 'text-white', 'mt-3');
            return;
        }

        message.textContent = data.mensagem || 'Cadastro realizado com sucesso!';
        message.classList.add('alert', 'bg-dark', 'border', 'border-white', 'text-white', 'mt-3');

        tipo.value = '';
        descricao.value = '';
        valor.value = '';
        categoria.value = '';

        tipo.dispatchEvent(new Event('change'));
        })
        .catch(err => {
            console.error(err);
            message.textContent = 'Erro de conexão com o servidor';
            message.classList.add('alert', 'bg-dark', 'border', 'border-white', 'text-white', 'mt-3');
        });
    });
});