// Sistema de login sem banco de dados
document.addEventListener('DOMContentLoaded', function() {
    const btnEntrar = document.getElementById('btnEntrar');
    
    // Credenciais válidas
    const validCredentials = {
        'rh_user': {
            password: 'rh123',
            redirectTo: 'recursos-humanos.HTML'
        },
        'fin_user': {
            password: 'fin123',
            redirectTo: 'financeiro.html'
        },
        'admin_user': {
            password: 'admin123',
            redirectTo: 'administracao.html'
        },
        'arthur_ataide678': {
            password: 'arthur123',
            redirectTo: 'recursos-humanos.HTML'
        },
        'rafael_pinheiro678': {
            password: 'rafael123',
            redirectTo: 'recursos-humanos.HTML'
        }
    };
    



// Botão Entrar
btnEntrar.addEventListener('click', function(e) {
    e.preventDefault(); // Previne o comportamento padrão
    
    const username = document.getElementById('usuario').value.trim();
    const password = document.getElementById('senha').value;
    
    // Verifica se as credenciais são válidas
    if (validCredentials[username] && validCredentials[username].password === password) {
        // Cria objeto com informações do usuário
        const userInfo = {
            username: username,
            name: username.split('_').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' '), // Formata o nome
            role: username.includes('rh') ? 'RH' : 
                  username.includes('fin') ? 'Financeiro' : 
                  username.includes('admin') ? 'Administrador' : 'Usuário'
        };
        
        // Armazena informações do usuário logado
        localStorage.setItem('currentUser', JSON.stringify(userInfo));
        
        // Obtém informações de localização
        const locationInfo = document.getElementById("localizacao").innerText || "Sem localização";
        
        // Registra o login com todos os detalhes
        registrarAtividade("Login realizado", {
            usuario: username,
            nomeFormatado: userInfo.name,
            perfil: userInfo.role,
            localizacao: locationInfo,
            dispositivo: navigator.userAgent,
            tela: `${window.screen.width}x${window.screen.height}`,
            sistemaOperacional: navigator.platform
        });

        // Redireciona
        window.location.href = validCredentials[username].redirectTo;

    } else {
        // Registra tentativa falha de login
        const locationInfo = document.getElementById("localizacao").innerText || "Sem localização";
        registrarAtividade("Tentativa de login falhou", {
            usuarioTentado: username,
            localizacao: locationInfo,
            dispositivo: navigator.userAgent
        });
        
        // Credenciais incorretas - mostra alerta
        alert('Usuário ou senha incorretos');
        
        // Limpa os campos do formulário
        document.getElementById('usuario').value = '';
        document.getElementById('senha').value = '';
        document.getElementById('usuario').focus();
    }
});
    
    // Permite login com Enter
    document.getElementById('senha').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            btnEntrar.click();
        }
    });
    
    document.getElementById('usuario').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('senha').focus();
        }
    });
    
    // Foca no campo de usuário quando a página carrega
    setTimeout(() => {
        document.getElementById('usuario').focus();
    }, 500);
});




// Esse é o código que traz a localização do usuário por meio do geolocation
function localizarUsuarioComGeocoding() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (posicao) => {
        const lat = posicao.coords.latitude;
        const lon = posicao.coords.longitude;

        let cidade = "Cidade não encontrada";
        let estado = "Estado não encontrado";
        let pais = "País não encontrado";
        let ip = "IP não disponível";

        // Busca localização reversa
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
          const data = await response.json();

          cidade = data.address.city || data.address.town || data.address.village || cidade;
          estado = data.address.state || estado;
          pais = data.address.country || pais;
        } catch (erro) {
          console.error("Erro ao converter coordenadas:", erro);
        }

        // Busca IP público
        try {
          const ipResponse = await fetch('https://api64.ipify.org?format=json');
          const ipData = await ipResponse.json();
          ip = ipData.ip;
        } catch (erro) {
          console.error("Erro ao buscar IP:", erro);
        }

        // Exibir tudo
        const info = `
          📍 ${cidade} - ${estado}, ${pais}
          🌐 IP: ${ip}
          📌 Coordenadas: ${lat.toFixed(5)}, ${lon.toFixed(5)}
        `;
        document.getElementById("localizacao").innerText = info;
      },
      (erro) => {
        alert("Para continuar, você precisa clicar em permitir.");
        window.location.href = "acesso-negado.html";
      }
    );
  } else {
    document.getElementById("localizacao").innerText = "Geolocalização não disponível.";
  }
}

/* Chame essa função quando ocorrerem ações importantes 
(Exemplo quando usuário faz logout:
registrarAtividade("Logout realizado");

// Exemplo quando usuário deleta arquivo:
registrarAtividade("Arquivo deletado: relatorio.pdf");
) */
function registrarAtividade(acao, detalhes = {}) {
    const logs = JSON.parse(localStorage.getItem("logAtividades")) || [];
    const user = JSON.parse(localStorage.getItem('currentUser')) || null;
    
    const logEntry = {
        timestamp: new Date().toLocaleString("pt-BR", {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }),
        usuario: user ? user.username : 'Sistema',
        nomeUsuario: user ? user.name : 'Sistema',
        perfilUsuario: user ? user.role : 'Sistema',
        acao: acao,
        detalhes: detalhes,
        localizacao: detalhes.localizacao || document.getElementById("localizacao")?.innerText || null,
        pagina: window.location.pathname.split('/').pop()
    };
    
    logs.push(logEntry);
    localStorage.setItem("logAtividades", JSON.stringify(logs));
}

window.onload = localizarUsuarioComGeocoding;
