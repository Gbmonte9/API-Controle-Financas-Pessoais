document.addEventListener('DOMContentLoaded', () => {
  const btnDownload = document.getElementById('btnDownloadPdf');

  if (!btnDownload) return;

  btnDownload.addEventListener('click', () => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Você precisa estar logado.');
      window.location.href = '/';
      return;
    }

    fetch('/relatorio/download-pdf', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao exportar PDF');
        return res.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'relatorio-financeiro.pdf';
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      })
      .catch(err => {
        console.error('Erro ao exportar PDF:', err);
        alert('Erro ao exportar PDF.');
      });
  });
});