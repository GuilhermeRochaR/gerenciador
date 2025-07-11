// Gerenciador de Arquivos - Sistema de RH
let arquivoEditando = null;

// Carrega dados do localStorage
function carregarDados() {
    carregarArquivos();
}

// Carrega arquivos do localStorage
function carregarArquivos() {
    let arquivos = JSON.parse(localStorage.getItem('arquivos_registrados') || '[]');
    exibirArquivos(arquivos);
}

// Exibe os arquivos na interface
function exibirArquivos(arquivos) {
    const lista = document.getElementById('listaArquivos');
    const totalElement = document.getElementById('totalArquivos');
    const expiradosElement = document.getElementById('arquivosExpirados');
    
    if (arquivos.length === 0) {
        lista.innerHTML = '<p class="no-files">Nenhum arquivo encontrado.</p>';
        totalElement.textContent = 'Total: 0 arquivos';
        expiradosElement.textContent = 'Expirados: 0';
        return;
    }
    
    const agora = new Date();
    let expirados = 0;
    
    const html = arquivos.map(arquivo => {
        const isExpirado = arquivo.dataExpiracao && arquivo.dataExpiracao < agora;
        if (isExpirado) expirados++;
        
        const dataEnvio = new Date(arquivo.dataEnvio).toLocaleDateString('pt-BR');
        const dataExpiracao = arquivo.dataExpiracao 
            ? new Date(arquivo.dataExpiracao).toLocaleDateString('pt-BR')
            : '—';
        
        const statusClass = isExpirado ? 'status-expirado' : 
                           arquivo.tipoExclusao === 'manual' ? 'status-manual' : 'status-automatica';
        
        const statusText = isExpirado ? 'EXPIRADO' : 
                          arquivo.tipoExclusao === 'manual' ? 'MANUAL' : 'AUTOMÁTICA';

        // Identificar origem com ícone
        const origemIcon = arquivo.origem === 'Cartões' ? '💳' : 
                          arquivo.origem === 'Financeiro' ? '💰' : '👥';
        const origemText = arquivo.origem || 'RH';
        
        return `
            <div class="file-item ${isExpirado ? 'expired' : ''}" onclick="mostrarDetalhesArquivo(${arquivo.id})">
                <div class="file-header">
                    <span class="file-name">📄 ${arquivo.nome}</span>
                    <div class="file-badges">
                        <span class="origem-badge">${origemIcon} ${origemText}</span>
                        <span class="file-status ${statusClass}">${statusText}</span>
                    </div>
                </div>
                <div class="file-details">
                    <div><strong>Tipo:</strong> ${arquivo.tipo}</div>
                    <div><strong>Tamanho:</strong> ${arquivo.tamanho}</div>
                    <div><strong>Enviado em:</strong> ${dataEnvio}</div>
                    <div><strong>Expira em:</strong> ${dataExpiracao}</div>
                    ${arquivo.nomePesquisa ? `<div><strong>Nome de Pesquisa:</strong> ${arquivo.nomePesquisa}</div>` : ''}
                    ${arquivo.observacao ? `<div><strong>Observação:</strong> ${arquivo.observacao}</div>` : ''}
                </div>
                <div class="file-actions" onclick="event.stopPropagation()">
                    <button class="btn btn-download" onclick="baixarArquivo(${arquivo.id})">
                        ⬇️ Baixar
                    </button>
                    <button class="btn btn-edit" onclick="editarArquivo(${arquivo.id})">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-delete" onclick="excluirArquivo(${arquivo.id})">
                        🗑️ Excluir
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    lista.innerHTML = html;
    totalElement.textContent = `Total: ${arquivos.length} arquivos`;
    expiradosElement.textContent = `Expirados: ${expirados}`;
}

// Mostra detalhes completos do arquivo
function mostrarDetalhesArquivo(id) {
    const arquivos = JSON.parse(localStorage.getItem('arquivos_registrados') || '[]');
    const arquivo = arquivos.find(a => a.id === id);
    
    if (!arquivo) return;
    
    let detalhesHTML = `
        <div class="modal-detalhes">
            <div class="modal-content-detalhes">
                <span class="close" onclick="fecharDetalhes()">&times;</span>
                <h3>📄 Detalhes do Arquivo</h3>
                <div class="detalhes-body">
                    <div class="detalhe-item">
                        <strong>Nome do arquivo:</strong> ${arquivo.nome}
                    </div>
                    <div class="detalhe-item">
                        <strong>Origem:</strong> ${arquivo.origem === 'Cartões' ? '💳 Cartões' : 
                                                  arquivo.origem === 'Financeiro' ? '💰 Financeiro' : '👥 RH'}
                    </div>
                    <div class="detalhe-item">
                        <strong>Tipo:</strong> ${arquivo.tipo}
                    </div>
                    <div class="detalhe-item">
                        <strong>Tamanho:</strong> ${arquivo.tamanho}
                    </div>
                    <div class="detalhe-item">
                        <strong>Data de envio:</strong> ${new Date(arquivo.dataEnvio).toLocaleDateString('pt-BR')}
                    </div>
                    <div class="detalhe-item">
                        <strong>Tipo de exclusão:</strong> ${arquivo.tipoExclusao === 'manual' ? 'Manual' : 'Automática'}
                    </div>
                    <div class="detalhe-item">
                        <strong>Data de expiração:</strong> ${arquivo.dataExpiracao ? new Date(arquivo.dataExpiracao).toLocaleDateString('pt-BR') : 'Sem expiração'}
                    </div>
    `;
    
    // Adicionar detalhes específicos do RH
    if (arquivo.origem === 'RH') {
        if (arquivo.nomePesquisa) {
            detalhesHTML += `
                <div class="detalhe-item">
                    <strong>Nome de Pesquisa:</strong> ${arquivo.nomePesquisa}
                </div>
            `;
        }
        if (arquivo.observacao) {
            detalhesHTML += `
                <div class="detalhe-item">
                    <strong>Observação:</strong> ${arquivo.observacao}
                </div>
            `;
        }
        if (arquivo.observacaoArquivo) {
            detalhesHTML += `
                <div class="detalhe-item">
                    <strong>Observações Adicionais:</strong> ${arquivo.observacaoArquivo}
                </div>
            `;
        }
    }
    
    // Adicionar detalhes específicos dos Cartões
    if (arquivo.origem === 'Cartões' && arquivo.dadosCartao) {
        detalhesHTML += `
            <div class="detalhe-secao">
                <h4>💳 Dados do Cartão</h4>
                <div class="detalhe-item">
                    <strong>Nome:</strong> ${arquivo.dadosCartao.nome}
                </div>
                <div class="detalhe-item">
                    <strong>CPF:</strong> ${arquivo.dadosCartao.cpf}
                </div>
                <div class="detalhe-item">
                    <strong>Número do Cartão:</strong> ${arquivo.dadosCartao.numeroCartao}
                </div>
                <div class="detalhe-item">
                    <strong>Secretaria/Órgão:</strong> ${arquivo.dadosCartao.orgao}
                </div>
                <div class="detalhe-item">
                    <strong>Data para Crédito:</strong> ${arquivo.dadosCartao.dataCredito}
                </div>
                <div class="detalhe-item">
                    <strong>Descrição:</strong> ${arquivo.dadosCartao.descricao}
                </div>
            </div>
        `;
    }
    
    // Adicionar detalhes específicos do Financeiro
    if (arquivo.origem === 'Financeiro' && arquivo.dadosFinanceiro) {
        detalhesHTML += `
            <div class="detalhe-secao">
                <h4>💰 Dados Financeiros</h4>
                <div class="detalhe-item">
                    <strong>Link:</strong> ${arquivo.dadosFinanceiro.link}
                </div>
                <div class="detalhe-item">
                    <strong>Número:</strong> ${arquivo.dadosFinanceiro.numero}
                </div>
                <div class="detalhe-item">
                    <strong>Nome:</strong> ${arquivo.dadosFinanceiro.nome}
                </div>
                <div class="detalhe-item">
                    <strong>Observação:</strong> ${arquivo.dadosFinanceiro.observacao}
                </div>
            </div>
        `;
    }
    
    detalhesHTML += `
                </div>
            </div>
        </div>
    `;
    
    // Criar e mostrar modal
    const modalDetalhes = document.createElement('div');
    modalDetalhes.id = 'modalDetalhes';
    modalDetalhes.className = 'modal';
    modalDetalhes.innerHTML = detalhesHTML;
    document.body.appendChild(modalDetalhes);
    modalDetalhes.style.display = 'block';
}

// Fecha modal de detalhes
function fecharDetalhes() {
    const modal = document.getElementById('modalDetalhes');
    if (modal) {
        modal.remove();
    }
}

// Pesquisa arquivos
function pesquisarArquivos() {
    const termo = document.getElementById('campoPesquisa').value.toLowerCase();
    const filtroTipo = document.getElementById('filtroTipo').value;
    const filtroOrigem = document.getElementById('filtroOrigem').value;
    
    let arquivos = JSON.parse(localStorage.getItem('arquivos_registrados') || '[]');
    
    // Filtrar por termo de pesquisa
    if (termo) {
        arquivos = arquivos.filter(arquivo => {
            const nomeMatch = arquivo.nome.toLowerCase().includes(termo);
            const origemMatch = arquivo.origem && arquivo.origem.toLowerCase().includes(termo);
            const nomePesquisaMatch = arquivo.nomePesquisa && arquivo.nomePesquisa.toLowerCase().includes(termo);
            const observacaoMatch = arquivo.observacao && arquivo.observacao.toLowerCase().includes(termo);
            const obsArquivoMatch = arquivo.observacaoArquivo && arquivo.observacaoArquivo.toLowerCase().includes(termo);
            
            // Para cartões, buscar também nos dados do cartão
            let dadosCartaoMatch = false;
            if (arquivo.dadosCartao) {
                dadosCartaoMatch = 
                    (arquivo.dadosCartao.nome && arquivo.dadosCartao.nome.toLowerCase().includes(termo)) ||
                    (arquivo.dadosCartao.cpf && arquivo.dadosCartao.cpf.includes(termo)) ||
                    (arquivo.dadosCartao.numeroCartao && arquivo.dadosCartao.numeroCartao.includes(termo)) ||
                    (arquivo.dadosCartao.orgao && arquivo.dadosCartao.orgao.toLowerCase().includes(termo));
            }
            
            return nomeMatch || origemMatch || nomePesquisaMatch || observacaoMatch || obsArquivoMatch || dadosCartaoMatch;
        });
    }
    
    // Filtrar por tipo de exclusão
    if (filtroTipo !== 'todos') {
        const agora = new Date();
        arquivos = arquivos.filter(arquivo => {
            switch (filtroTipo) {
                case 'manual':
                    return arquivo.tipoExclusao === 'manual';
                case 'automatica':
                    return arquivo.tipoExclusao === 'automatica';
                case 'expirados':
                    return arquivo.dataExpiracao && arquivo.dataExpiracao < agora;
                default:
                    return true;
            }
        });
    }
    
    // Filtrar por origem
    if (filtroOrigem !== 'todas') {
        arquivos = arquivos.filter(arquivo => {
            return arquivo.origem === filtroOrigem;
        });
    }
    
    exibirArquivos(arquivos);
}

// Limpa a pesquisa
function limparPesquisa() {
    document.getElementById('campoPesquisa').value = '';
    document.getElementById('filtroTipo').value = 'todos';
    document.getElementById('filtroOrigem').value = 'todas';
    carregarArquivos();
}

// Edita um arquivo
function editarArquivo(id) {
    const arquivos = JSON.parse(localStorage.getItem('arquivos_registrados') || '[]');
    const arquivo = arquivos.find(a => a.id === id);
    
    if (!arquivo) return;
    
    arquivoEditando = arquivo;
    
    // Preencher modal de edição
    document.getElementById('nomeArquivoModal').textContent = arquivo.nome;
    document.querySelector(`input[name="tipoExclusaoModal"][value="${arquivo.tipoExclusao}"]`).checked = true;
    
    // Configurar campo de data
    const tempoGroup = document.getElementById('tempoExclusaoModalGroup');
    const dataInput = document.getElementById('dataExpiracaoModal');
    const textoAjuda = document.getElementById('textoAjudaData');
    
    // Sempre mostrar o campo de data
    tempoGroup.style.display = 'block';
    
    // Preencher data se existir
    if (arquivo.dataExpiracao) {
        dataInput.value = new Date(arquivo.dataExpiracao).toISOString().split('T')[0];
    } else {
        dataInput.value = '';
    }
    
    // Função para atualizar texto de ajuda
    function atualizarTextoAjuda() {
        const tipoSelecionado = document.querySelector('input[name="tipoExclusaoModal"]:checked').value;
        if (tipoSelecionado === 'manual') {
            textoAjuda.textContent = 'Para exclusão manual, deixe em branco para manter indefinidamente ou escolha uma data específica';
        } else {
            textoAjuda.textContent = 'Para exclusão automática, escolha a data de expiração do arquivo';
        }
    }
    
    // Event listeners para atualizar texto de ajuda
    document.querySelectorAll('input[name="tipoExclusaoModal"]').forEach(radio => {
        radio.addEventListener('change', atualizarTextoAjuda);
    });
    
    // Atualizar texto inicial
    atualizarTextoAjuda();
    
    document.getElementById('modalEdicao').style.display = 'block';
}

// Salva edição do arquivo
function salvarEdicao() {
    if (!arquivoEditando) return;
    
    const novoTipo = document.querySelector('input[name="tipoExclusaoModal"]:checked').value;
    const novaData = document.getElementById('dataExpiracaoModal').value;
    
    let arquivos = JSON.parse(localStorage.getItem('arquivos_registrados') || '[]');
    const index = arquivos.findIndex(a => a.id === arquivoEditando.id);
    
    if (index !== -1) {
        arquivos[index].tipoExclusao = novoTipo;
        
        // Para ambos os tipos (manual e automática), permitir definir data
        if (novaData) {
            arquivos[index].dataExpiracao = new Date(novaData);
        } else {
            // Se não há data definida, deixar como null (indefinido)
            arquivos[index].dataExpiracao = null;
        }
        
        localStorage.setItem('arquivos_registrados', JSON.stringify(arquivos));
        carregarArquivos();
        fecharModal();
        alert('Arquivo atualizado com sucesso!');
    }
}

// Fecha modal de edição
function fecharModal() {
    document.getElementById('modalEdicao').style.display = 'none';
    arquivoEditando = null;
}

// Baixa um arquivo
function baixarArquivo(id) {
    const arquivos = JSON.parse(localStorage.getItem("arquivos_registrados") || "[]");
    const arquivo = arquivos.find(a => a.id === id);

    if (!arquivo) {
        alert("Arquivo não encontrado.");
        return;
    }

    let conteudoParaDownload = "";
    let tipoMime = "text/plain";
    let nomeArquivo = arquivo.nome;

    // Se o arquivo tem conteúdo (arquivos do Financeiro)
    if (arquivo.origem === 'Financeiro' && arquivo.conteudo) {
        conteudoParaDownload = arquivo.conteudo;
    } 
    // Para arquivos de RH, simular um download de arquivo genérico
    else if (arquivo.origem === 'RH') {
        conteudoParaDownload = `Este é um placeholder para o arquivo original ${arquivo.nome}.\n\nEm um sistema real, o arquivo original seria baixado aqui.`;
        tipoMime = 'application/octet-stream'; // Tipo MIME genérico para download
        nomeArquivo = arquivo.nome; // Manter o nome original do arquivo
    }
    // Para arquivos de Cartões, simular um download de arquivo genérico
    else if (arquivo.origem === 'Cartões') {
        conteudoParaDownload = `Este é um placeholder para o arquivo original ${arquivo.nome}.\n\nEm um sistema real, o arquivo original seria baixado aqui.`;
        tipoMime = 'application/octet-stream'; // Tipo MIME genérico para download
        nomeArquivo = arquivo.nome; // Manter o nome original do arquivo
    }
    // Fallback para outros tipos de arquivo
    else {
        const dataEnvio = new Date(arquivo.dataEnvio).toLocaleString('pt-BR');
        const dataExpiracao = arquivo.dataExpiracao 
            ? new Date(arquivo.dataExpiracao).toLocaleString('pt-BR')
            : 'Sem expiração';
        
        conteudoParaDownload = `INFORMAÇÕES DO ARQUIVO
======================

Nome do arquivo: ${arquivo.nome}
Origem: ${arquivo.origem || 'Não especificada'}
Tipo: ${arquivo.tipo}
Tamanho: ${arquivo.tamanho}
Data de envio: ${dataEnvio}
Tipo de exclusão: ${arquivo.tipoExclusao === 'manual' ? 'Manual' : 'Automática'}
Data de expiração: ${dataExpiracao}

---
Arquivo de informações gerado pelo sistema de gerenciamento.`;
        
        nomeArquivo = `info_${arquivo.nome.replace(/\.[^/.]+$/, "")}.txt`;
    }

    // Criar o blob e fazer o download
    const blob = new Blob([conteudoParaDownload], { type: tipoMime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Mostrar mensagem de sucesso
    if (arquivo.origem === 'Financeiro' && arquivo.conteudo) {
        alert("✅ Arquivo baixado com sucesso!");
    } else {
        alert("✅ Arquivo baixado com sucesso!");
    }
}

// Exclui um arquivo
function excluirArquivo(id) {
    if (confirm('Tem certeza que deseja excluir este arquivo?')) {
        let arquivos = JSON.parse(localStorage.getItem('arquivos_registrados') || '[]');
        arquivos = arquivos.filter(a => a.id !== id);
        localStorage.setItem('arquivos_registrados', JSON.stringify(arquivos));
        carregarArquivos();
        alert('Arquivo excluído com sucesso!');
    }
}

// Volta para RH
function voltarParaRH() {
    window.location.href = 'recursos-humanos.HTML';
}

// Inicializa quando a página carrega
document.addEventListener('DOMContentLoaded', carregarDados);

