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
    
    btnEntrar.addEventListener('click', function(e) {
        e.preventDefault(); // Previne o comportamento padrão
        
        const username = document.getElementById('usuario').value.trim();
        const password = document.getElementById('senha').value;
        
        // Verifica se as credenciais são válidas
        if (validCredentials[username] && validCredentials[username].password === password) {
            // Credenciais corretas - redireciona para a página apropriada
            window.location.href = validCredentials[username].redirectTo;
        } else {
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
