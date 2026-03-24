// --- LÓGICA DE ALTERNÂNCIA (TEXTO VS ARQUIVO) ---

// Limpa o upload se o usuário começar a digitar texto
document.getElementById('emailText').addEventListener('input', () => {
    document.getElementById('fileInput').value = "";
});

// Limpa o campo de texto se o usuário selecionar um arquivo
document.getElementById('fileInput').addEventListener('change', () => {
    document.getElementById('emailText').value = "";
});




// --- FUNÇÃO PRINCIPAL DE PROCESSAMENTO ---

async function processarEmail() {
    const btn = document.getElementById('btnProcessar');
    const spinner = document.getElementById('spinner');
    const btnText = document.getElementById('btnText');
    const emailText = document.getElementById('emailText').value;
    const fileInput = document.getElementById('fileInput');
    const resArea = document.getElementById('respostaSugerida');
    const badge = document.getElementById('badgeCategoria');
    const resultCard = document.getElementById('resultCard');

    // Validação inicial
    if (!emailText.trim() && fileInput.files.length === 0) {
        alert("Por favor, insira um texto ou selecione um arquivo.");
        return;
    }

    // Feedback Visual de Carregamento
    btn.disabled = true;
    spinner.classList.remove('hidden');
    btnText.innerText = "Processando...";
    resultCard.classList.add('opacity-50');

    const coldStartTimer = setTimeout(() => {
        // Se após 4 segundos o botão ainda estiver desativado, avisamos o usuário
        if (btn.disabled) { 
            resArea.innerText = "O servidor do Render está acordando... Isso pode levar até 30 segundos no primeiro acesso.";
        }
    }, 4000);
    
    try {
        let response;
        
        const API_BASE_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" 
                        ? "http://localhost:8000" 
                        : "__API_URL_PLACEHOLDER__";        

        if (fileInput.files.length > 0) {
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            response = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: formData });
        } else {
            response = await fetch(`${API_BASE_URL}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: emailText })
            });
        }

        // 1. Tratamento Robusto de Respostas de Erro (400, 422, 500)
        if (!response.ok) {
            let errorMessage = "Falha na comunicação com o servidor.";
            
            try {
                const errorData = await response.json();
                // Tenta pegar o 'detail' do FastAPI, se não existir usa a genérica
                errorMessage = errorData?.detail ?? errorMessage;
            } catch (jsonError) {
                // Caso o erro seja tão grave que nem JSON o servidor retornou
                console.error("Erro ao parsear JSON de erro:", jsonError);
            }
            
            throw new Error(errorMessage);
        }

        const data = await response.json();
        exibirResultado(data);

    } catch (error) {
       resultCard.classList.remove('opacity-50');
        badge.innerText = "Aviso";
        badge.className = "mt-1 inline-block px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-700";
        
        // 2. Lógica de Exibição Final
        if (error.message === "SISTEMA_OFFLINE" || error.message.includes("fetch")) {
            resArea.innerText = "Houve uma falha de comunicação com o servidor. Por favor, tente novamente mais tarde.";
        } else {
            // Aqui ele exibe apenas as mensagens que definimos no 'detail' do Backend
            resArea.innerText = error.message;
        }

        resArea.classList.add('text-amber-600', 'font-medium');
        resArea.classList.remove('text-slate-800');
    } finally {
        btn.disabled = false;
        spinner.classList.add('hidden');
        btnText.innerText = "Analisar Email";
    }
}


// --- FUNÇÕES DE INTERFACE E UTILITÁRIOS ---

function exibirResultado(data) {
    const badge = document.getElementById('badgeCategoria');
    const resArea = document.getElementById('respostaSugerida');
    const resultCard = document.getElementById('resultCard');

    resultCard.classList.remove('opacity-50', 'bg-white');
    resultCard.classList.add('bg-white'); // Garante fundo branco
    
    badge.innerText = data.categoria;
    resArea.innerText = data.resposta;
    
    resArea.classList.remove('italic', 'text-slate-500', 'text-red-500','text-amber-600', 'font-medium');
    resArea.classList.add('text-slate-800');

    if (data.categoria === "Produtivo") {
        badge.className = "mt-1 inline-block px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700";
    } else {
        badge.className = "mt-1 inline-block px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-700";
    }
}

function copiarResposta() {
    const texto = document.getElementById('respostaSugerida').innerText;
    navigator.clipboard.writeText(texto);
    alert("Resposta copiada para a área de transferência!");
}

function abrirEmail() {
    const corpoResposta = document.getElementById('respostaSugerida').innerText;
    const assunto = "Re: Resposta à sua solicitação";
    const mailtoLink = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpoResposta)}`;
    window.location.href = mailtoLink;
}