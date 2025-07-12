let arquivosRegistrados = [];

const uploadArea = document.getElementById("uploadArea");
const fileList = document.getElementById("fileList");
let arquivos = [];

uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.classList.add("dragover");
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("dragover");
});

uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("dragover");

  const files = Array.from(e.dataTransfer.files);
  if (files.length > 0) {
    mostrarAnimacaoDeCarregamento();

    setTimeout(() => {
      arquivos.push(...files);
      atualizarListaArquivos();
    }, 1000);
  }
});

function mostrarAnimacaoDeCarregamento() {
  fileList.innerHTML = `<p class="loading">Carregando arquivo...</p>`;
}

function atualizarListaArquivos() {
  fileList.innerHTML = "";

  arquivos.forEach((arquivo, index) => {
    const item = document.createElement("div");
    item.className = "file-item";
    item.innerHTML = `
      <div style="flex: 1;">
        <strong>${arquivo.name}</strong><br>
        <div class="exclusao-config" style="margin-top: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; background-color: #f9f9f9;">
          <h4 style="margin: 0 0 10px 0; color: #333;">⚙️ Configuração de Exclusão</h4>
          
          <div style="margin-bottom: 10px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Tipo de Exclusão:</label>
            <label style="margin-right: 15px;">
              <input type="radio" name="exclusao_${index}" value="manual" checked>
              Manual
            </label>
            <label>
              <input type="radio" name="exclusao_${index}" value="automatica">
              Automática
            </label>
          </div>
          
          <div id="prazoConfig_${index}" style="margin-bottom: 10px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Prazo para Exclusão:</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <input type="number" min="1" max="60" value="6" id="prazo_${index}" style="width: 80px; padding: 5px; border: 1px solid #ccc; border-radius: 3px;">
              <span>meses</span>
            </div>
            <p id="mensagem_${index}" style="font-size: 12px; color: #666; margin: 5px 0 0 0;">
              Este arquivo será mantido por 6 meses
            </p>
          </div>
          
          <div style="margin-top: 10px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Observações Adicionais:</label>
            <textarea id="obsArquivo_${index}" placeholder="Observações específicas para este arquivo..." style="width: 100%; height: 60px; padding: 5px; border: 1px solid #ccc; border-radius: 3px; resize: vertical;"></textarea>
          </div>
        </div>
      </div>
      <button onclick="removerArquivo(${index})" style="background-color: #e74c3c; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-left: 10px;">Remover</button>
    `;

    fileList.appendChild(item);

    // Event listeners para controle da exclusão
    const radios = item.querySelectorAll(`input[name="exclusao_${index}"]`);
    const prazoInput = document.getElementById(`prazo_${index}`);
    const mensagem = document.getElementById(`mensagem_${index}`);

    // Função para atualizar a mensagem baseada no tipo e prazo
    function atualizarMensagem() {
      const tipoSelecionado = document.querySelector(`input[name="exclusao_${index}"]:checked`).value;
      const prazo = prazoInput.value;
      
      if (tipoSelecionado === "automatica") {
        mensagem.innerText = `Este arquivo será excluído automaticamente em ${prazo} ${prazo == 1 ? "mês" : "meses"}`;
        mensagem.style.color = "#e67e22";
      } else {
        mensagem.innerText = `Este arquivo será mantido indefinidamente (exclusão manual)`;
        mensagem.style.color = "#27ae60";
      }
    }

    radios.forEach(radio => {
      radio.addEventListener("change", atualizarMensagem);
    });

    prazoInput.addEventListener("input", atualizarMensagem);

    // Inicializar mensagem
    atualizarMensagem();
  });

  verificarCampos();
}

function removerArquivo(index) {
  arquivos.splice(index, 1);
  atualizarListaArquivos();
}

const inputPesquisa = document.getElementById("pesquisa");
const btnSalvar = document.getElementById("btnSalvar");
const mensagemSucesso = document.getElementById("mensagemSucesso");

// Verifica se pode ativar o botão
function verificarCampos() {
  const pesquisaPreenchida = inputPesquisa.value.trim() !== "";
  const temArquivos = arquivos.length > 0;

  btnSalvar.disabled = !temArquivos;
}

// Verifica em tempo real ao digitar no campo
inputPesquisa.addEventListener("input", verificarCampos);

// Clique no botão SALVAR
btnSalvar.addEventListener("click", (e) => {
  e.preventDefault();

  const nomePesquisa = inputPesquisa.value.trim();
  const observacao = document.getElementById("observacao").value.trim();
  const dataEnvio = new Date();

  arquivos.forEach((arquivo, index) => {
    const tipoExclusao = document.querySelector(`input[name="exclusao_${index}"]:checked`).value;
    const prazoMeses = parseInt(document.getElementById(`prazo_${index}`).value);
    const obsArquivo = document.getElementById(`obsArquivo_${index}`).value.trim();
    
    let dataExpiracao = null;
    if (tipoExclusao === "automatica") {
      dataExpiracao = new Date(dataEnvio);
      dataExpiracao.setMonth(dataEnvio.getMonth() + prazoMeses);
    }

    // Criar objeto do arquivo para salvar no gerenciador
    const arquivoParaGerenciador = {
      id: Date.now() + index, // ID único
      nome: arquivo.name,
      tipoExclusao,
      dataEnvio,
      dataExpiracao,
      tamanho: formatarTamanho(arquivo.size),
      tipo: obterTipoArquivo(arquivo.name),
      nomePesquisa,
      observacao,
      observacaoArquivo: obsArquivo,
      origem: 'RH'
    };

    // Salvar no localStorage para o gerenciador
    salvarArquivoNoGerenciador(arquivoParaGerenciador);

    // Manter compatibilidade com o sistema antigo
    arquivosRegistrados.push({
      nome: arquivo.name,
      tipoExclusao,
      dataEnvio,
      dataExpiracao,
      conteudo: arquivo
    });
  });

  mensagemSucesso.style.display = "block";
  mensagemSucesso.innerText = `✔️ ${arquivos.length} arquivo(s) salvos com sucesso no gerenciador!`;
  
  // Limpar formulário
  arquivos = [];
  atualizarListaArquivos();
  inputPesquisa.value = "";
  document.getElementById("observacao").value = "";
  verificarCampos();

  // Esconder mensagem após 3 segundos
  setTimeout(() => {
    mensagemSucesso.style.display = "none";
  }, 3000);
});

// Função para salvar arquivo no gerenciador
function salvarArquivoNoGerenciador(arquivo) {
  let arquivosGerenciador = JSON.parse(localStorage.getItem('arquivos_registrados') || '[]');
  arquivosGerenciador.push(arquivo);
  localStorage.setItem('arquivos_registrados', JSON.stringify(arquivosGerenciador));
}

// Função para formatar tamanho do arquivo
function formatarTamanho(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Função para obter tipo do arquivo
function obterTipoArquivo(nomeArquivo) {
  const extensao = nomeArquivo.split('.').pop().toUpperCase();
  return extensao;
}

// Código da área drag and drop para caso ela seja clicada
const fileInput = document.getElementById("fileInput");

// Permitir clicar na área para abrir o explorador de arquivos
uploadArea.addEventListener("click", (e) => {
  const ignorarTags = ["INPUT", "LABEL", "BUTTON", "TEXTAREA"];
  if (ignorarTags.includes(e.target.tagName)) return;
  fileInput.click();
});

// Quando arquivos forem escolhidos pelo input
fileInput.addEventListener("change", (event) => {
  const files = Array.from(event.target.files);

  if (files.length > 0) {
    mostrarAnimacaoDeCarregamento();

    setTimeout(() => {
      arquivos.push(...files);
      atualizarListaArquivos();
      fileInput.value = "";
    }, 1000);
  }
});

// Visualização de arquivos (sistema antigo mantido para compatibilidade)
document.getElementById("btnVisualizar").addEventListener("click", () => {
  const area = document.getElementById("areaVisualizacao");
  const lista = document.getElementById("listaArquivosRegistrados");

  if (arquivosRegistrados.length === 0) {
    lista.innerHTML = "<p>Nenhum arquivo registrado ainda. Use o gerenciador para ver todos os arquivos.</p>";
  } else {
    lista.innerHTML = arquivosRegistrados.map((arquivo, index) => {
      const envio = arquivo.dataEnvio.toLocaleDateString("pt-BR");
      const expiracao = arquivo.dataExpiracao
        ? arquivo.dataExpiracao.toLocaleDateString("pt-BR")
        : "—";

      return `
        <div style="border-bottom: 1px solid #ccc; padding: 10px 0;">
          <strong>📄 ${arquivo.nome}</strong><br>
          Tipo de exclusão: <em>${arquivo.tipoExclusao}</em><br>
          Enviado em: ${envio}<br>
          Expira em: ${expiracao}<br>
          <button disabled style="margin-top: 5px;">⬇️ Baixar</button>
          <button onclick="excluirArquivoRegistrado(${index})" style="background-color:#ff6666; color:white; border:none; padding:5px 10px; margin-left:10px; border-radius:4px;">🗑️ Excluir</button>
        </div>
      `;
    }).join("");
  }

  area.style.display = "block";
});

function excluirArquivoRegistrado(index) {
  if (confirm("Tem certeza que deseja excluir este arquivo?")) {
    arquivosRegistrados.splice(index, 1);
    document.getElementById("btnVisualizar").click();
  }
}

// Função para abrir o gerenciador
function abrirGerenciador() {
  window.location.href = 'gerenciador.html';
}