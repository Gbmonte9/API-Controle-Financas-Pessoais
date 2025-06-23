document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token'); 
    console.log("Token ", token);

    fetch('/relatorio', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
    })
    .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar dados do relatório');
        return res.json();
    })
    .then(data => {
        document.getElementById('totalReceitas').textContent = `R$ ${parseFloat(data.receita).toFixed(2)}`;
        document.getElementById('totalDespesas').textContent = `R$ ${parseFloat(data.despesa).toFixed(2)}`;
        document.getElementById('saldoFinal').textContent = `R$ ${parseFloat(data.saldo).toFixed(2)}`;

        document.getElementById('descricaoMaiorReceita').textContent = data.maiorReceita?.descricao || '---';
        document.getElementById('valorMaiorReceita').textContent = `R$ ${parseFloat(data.maiorReceita?.valor || 0).toFixed(2)}`;

        document.getElementById('descricaoMaiorDespesa').textContent = data.maiorDespesa?.descricao || '---';
        document.getElementById('valorMaiorDespesa').textContent = `R$ ${parseFloat(data.maiorDespesa?.valor || 0).toFixed(2)}`;

        const tabela = document.getElementById('tabelaRelatorio');
        tabela.innerHTML = ''; 

        if (data.resumoPorCategoria && data.resumoPorCategoria.length > 0) {
          data.resumoPorCategoria.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${item.categoria}</td>
              <td>${item.tipo}</td>
              <td>R$ ${parseFloat(item.total).toFixed(2)}</td>
            `;
            tabela.appendChild(tr);
          });
        } else {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td colspan="3" class="text-center">Nenhum dado disponível.</td>`;
          tabela.appendChild(tr);
        }

        const ctxPizza = document.getElementById('graficoPizza').getContext('2d');
        const ctxBarras = document.getElementById('graficoBarras').getContext('2d');

        const categorias = {};
        (data.resumoPorCategoria || []).forEach(item => {
          if (!categorias[item.categoria]) categorias[item.categoria] = 0;
          categorias[item.categoria] += parseFloat(item.total);
        });

        const labels = Object.keys(categorias);
        const valores = Object.values(categorias);

        new Chart(ctxPizza, {
          type: 'pie',
          data: {
            labels,
            datasets: [{
              label: 'Total por Categoria',
              data: valores,
              backgroundColor: ['#ffffff', '#cccccc', '#999999', '#666666', '#333333'], 
              borderColor: '#000000',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#ffffff' 
                }
              }
            }
          }
        });

        new Chart(ctxBarras, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Total por Categoria',
              data: valores,
              backgroundColor: [
                '#ffffff', 
                '#cccccc',
                '#999999', 
                '#666666', 
                '#333333'  
              ],
              borderColor: '#000000',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  color: '#ffffff' 
                },
                grid: {
                  color: '#444444'
                }
              },
              x: {
                ticks: {
                  color: '#ffffff' 
                },
                grid: {
                  color: '#444444' 
                }
              }
            },
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });

    })
    .catch(err => {
        console.error(err);
        alert('Erro ao carregar dados do relatório.');
    });
});