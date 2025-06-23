document.addEventListener('DOMContentLoaded', function () {
  const transacaoId = window.transacaoId; // <- essa variável virá de um script inline no HTML
  const tipoSelect = document.getElementById('tipo');
  const categoriaSelect = document.getElementById('categoria');
  const descricaoInput = document.getElementById('descricao');
  const valorInput = document.getElementById('valor');
  const btnAtualizar = document.getElementById('btnAtualizarTransacao');
  const message = document.getElementById('message');

  const token = localStorage.getItem('token');
  const emailToken = localStorage.getItem('email');

  const categoriasReceita = ["Salário", "Investimentos", "Prêmios", "Outros"];
  const categoriasDespesa = ["Alimentação", "Transporte", "Moradia", "Saúde", "Educação", "Lazer", "Outros"];

    function popularCategorias(opcoes, categoriaSelecionada = "") {
        categoriaSelect.innerHTML = '<option value="" disabled>Selecione a categoria</option>';
        opcoes.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        if (cat === categoriaSelecionada) option.selected = true;
        categoriaSelect.appendChild(option);
        });
    }

    if (!token || !emailToken) {
        alert('Você precisa estar logado.');
        window.location.href = '/';
        return;
    }

    fetch(`/transacao/dados/transacao_id/${transacaoId}`, {
        method: 'GET',
            headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
        if (!ok) {
            alert(data.erro || 'Erro ao buscar transação');
            return;
        }

        tipoSelect.value = data.tipo;
        descricaoInput.value = data.descricao;
        valorInput.value = data.valor;

        if (data.tipo === 'receita') {
            popularCategorias(categoriasReceita, data.categoria);
        } else if (data.tipo === 'despesa') {
            popularCategorias(categoriasDespesa, data.categoria);
        }
        })
        .catch(err => {
        console.error(err);
        alert('Erro ao buscar dados da transação');
    });

    tipoSelect.addEventListener('change', () => {
        if (tipoSelect.value === 'receita') {
        popularCategorias(categoriasReceita);
        } else if (tipoSelect.value === 'despesa') {
        popularCategorias(categoriasDespesa);
        } else {
        categoriaSelect.innerHTML = '<option value="" disabled selected>Selecione a categoria</option>';
        }
    });

    btnAtualizar.addEventListener('click', () => {
        const tipo = tipoSelect.value;
        const descricao = descricaoInput.value;
        const valor = parseFloat(valorInput.value);
        const categoria = categoriaSelect.value;

        if (!tipo || !descricao || !valor || !categoria) {
        message.textContent = 'Por favor, preencha todos os campos.';
        message.classList.remove('text-success');
        message.classList.add('text-danger');
        return;
        }

        fetch(`/transacao/${transacaoId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
            body: JSON.stringify({ tipo, descricao, valor, categoria })
        })
        .then(res => res.json().then(data => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
            if (!ok) {
                message.textContent = data.mensagem || 'Error no servidor';
                message.classList.remove('text-success');
                message.classList.add('alert', 'bg-dark', 'border', 'border-white', 'text-white', 'mt-3');
            return;
            }

            message.textContent = 'Transação atualizada com sucesso!';
            message.classList.remove('text-danger');
            message.classList.add('alert', 'bg-dark', 'border', 'border-white', 'text-white', 'mt-3');

            setTimeout(() => {
                window.location.href = '/transacoes';
            }, 2000);
        })
        .catch(err => {
            console.error(err);
            message.textContent = 'Erro ao conectar com o servidor';
            message.classList.remove('text-success');
            message.classList.add('alert', 'bg-dark', 'border', 'border-white', 'text-white', 'mt-3');
        });
    });
});