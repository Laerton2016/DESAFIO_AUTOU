# 📧 AI Email Classifier & Responder

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Esta é uma aplicação Full-stack moderna desenvolvida para o desafio técnico da **AutoU**. O sistema utiliza Inteligência Artificial Generativa para classificar emails em **Produtivo** ou **Improdutivo** e sugerir respostas automáticas, com suporte a processamento de texto direto e arquivos PDF.

---

## ✨ Funcionalidades e Diferenciais

- **Classificação Inteligente:** Utiliza o modelo `Gemini 3.1 Flash Lite (Preview)` para entender o contexto real do email.
- **Processamento Multimodal:** Capaz de analisar arquivos `.pdf` e `.txt` enviando o binário diretamente para a IA, preservando a estrutura do documento.
- **Interface Responsiva:** Desenvolvida com Tailwind CSS, focada em uma experiência de usuário (UX) limpa e intuitiva.
- **Fluxo de Trabalho:** Integração com cliente de email padrão (Outlook/Gmail) via protocolo `mailto:`.
- **Tratamento de Erros:** Sistema resiliente com feedbacks visuais para falhas de comunicação ou entradas inválidas.

---

## 🛠️ Tecnologias Utilizadas

- **Backend:** Python 3.12+, FastAPI, Uvicorn.
- **IA:** Google Generative AI SDK (Gemini API).
- **Frontend:** HTML5, JavaScript (Fetch API), Tailwind CSS (CDN).
- **Segurança:** Configuração de CORS e gestão de credenciais via Variáveis de Ambiente.

---

## 🚀 Como Executar o Projeto

### 1. Requisitos Prévios
Certifique-se de ter o **Python 3.9+** instalado em sua máquina.

### 2. Configurando a chave da IA (Google Gemini)
Para que a aplicação funcione, você precisará de uma chave gratuita:
1. Acesse o [Google AI Studio](https://aistudio.google.com/).
2. Clique em **"Get API Key"**.
3. Crie uma nova chave e copie o código gerado.
4. Crie um arquivo chamado .env na pasta na raiz, conforme sua estrutura, e adicione sua chave: GEMINI_API_KEY=SUA_CHAVE_AQUI.

### NOTAS
1. O arquivo .env já está listado no .gitignore para garantir que sua chave privada não seja enviada para o repositório público.
2. Neste projeto estamos usando "models/gemini-3.1-flash-lite-preview" para testes com limitação de 500 RPD (Solicitações por dia) / 250K TPM (Tokens por minuto) / 15 RPM (Solicitações por minuto)
3. Para uso em produção, adicione a variável `FRONTEND_URL`, no arquivo .env na pasta raiz, com o link do endereço em que o front está hospedado em produção. Esta URL configura a permissão de requisições via CORS. Para uso local esta configuração não se faz necessária.
4. No `index.js` em `frontend\scripts\` deve-se injetar na variável `API_URL` a URL base do serviço de Backend de produção. Para uso local, essa configuração é dinâmica.

### 3. Instalação
No terminal (dentro da pasta do projeto):

```bash
# Crie um ambiente virtual
python -m venv venv

# Ative o ambiente
# No Windows:
.\venv\Scripts\activate
# No Mac/Linux:
source venv/bin/activate

# Instale as dependências
pip install fastapi uvicorn python-multipart google-generativeai python-dotenv pymupdf

```
### 4. Rodando a Aplicação
Inicie o servidor backend:

```bash
uvicorn main:app --reload
```
O servidor estará rodando em http://127.0.0.1:8000.
Agora, basta abrir o arquivo index.html (preferencialmente usando a extensão Live Server do VS Code) no seu navegador.




## 📁 Estrutura do Repositório

```text
.
├── backend/
│   ├── main.py            # Servidor FastAPI e lógica de IA
│   ├── requirements.txt   # Dependências do projeto
│   └── .env               # (Não versionado) Chaves de API
├── frontend/
│   ├── index.html         # Interface do usuário
│   └── scripts/
│       └── index.js       # Lógica da interface do usuário
├── examples/              # Arquivos .txt e .pdf para teste rápido
└── README.md

👨‍💻 Autor
Desenvolvido por Laerton Marques de Figueiredo Analista de Sistemas Fullstack
