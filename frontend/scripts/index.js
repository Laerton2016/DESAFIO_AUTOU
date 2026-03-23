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

    try {
        let response;
        
        // Prioriza o arquivo se houver um selecionado
        if (fileInput.files.length > 0) {
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            // IMPORTANTE: Altere para sua URL final após o deploy no Render
            response = await fetch('http://localhost:8000/upload', { 
                method: 'POST', 
                body: formData 
            });
        } else {
            response = await fetch('http://localhost:8000/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: emailText })
            });
        }

        if (!response.ok) throw new Error("Falha na API");

        const data = await response.json();
        exibirResultado(data);

    } catch (error) {
        // Tratamento de erro na interface
        resultCard.classList.remove('opacity-50');
        badge.innerText = "Erro";
        badge.className = "mt-1 inline-block px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700";
        resArea.innerText = "Houve uma falha interna na comunicação com a IA. Por favor, tente novamente mais tarde.";
        resArea.classList.add('text-red-500');
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
    resArea.classList.remove('italic', 'text-slate-500', 'text-red-500');
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