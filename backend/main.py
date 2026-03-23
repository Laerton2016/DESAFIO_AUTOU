import os
import re
import json
import google.generativeai as genai
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Configurações iniciais
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Centralização do Prompt para facilitar manutenção
PROMPT_PRINCIPAL = """
Aja como um assistente de triagem de emails da equipe AutoU. 
Analise o conteúdo e retorne ESTRITAMENTE um objeto JSON com:
1. "categoria": "Produtivo" (requer ação/suporte) ou "Improdutivo" (agradecimento/social).
2. "resposta": Uma sugestão curta e profissional, identificando o remetente se possível. 
Ao término da resposta, adicione: "Atenciosamente, equipe AutoU."
"""

# Inicialização do Modelo
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(model_name='models/gemini-3.1-flash-lite-preview')

app = FastAPI(title="Email Classifier AI - AutoU Challenge")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailInput(BaseModel):
    content: str

def clean_text(text: str) -> str:
    """Sanitiza o texto para segurança e economia de tokens."""
    if not text: return ""

    # Segurança: Remove linhas com javascript: e blocos de código/style
    text = re.sub(r'^.*j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:.*$', '', text, flags=re.IGNORECASE | re.MULTILINE)
    text = re.sub(r'<(script|style).*?>.*?</\1>', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<.*?>', '', text) # Remove HTML restante
    text = re.sub(r'on\w+\s*=', '', text, flags=re.IGNORECASE) # Remove eventos JS

    # Saneamento de conteúdo
    text = text.lower()
    text = re.sub(r'http\S+|www\S+', '', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    return re.sub(r'\s+', ' ', text).strip()

def parse_ai_json(raw_response: str):
    """Extrai e valida o JSON retornado pela IA."""
    try:
        clean_json = re.sub(r'```json|```', '', raw_response).strip()
        return json.loads(clean_json)
    except Exception:
        return {"categoria": "Erro", "resposta": "Falha ao decodificar resposta da IA."}

@app.post("/analyze")
async def analyze_email(data: EmailInput):
    if not data.content.strip():
        raise HTTPException(status_code=400, detail="Conteúdo vazio")

    cleaned = clean_text(data.content)
    if not cleaned:
        return {"categoria": "Improdutivo", "resposta": "Conteúdo insuficiente para análise segura.\n\nAtenciosamente, equipe AutoU."}

    try:
        response = model.generate_content(f"{PROMPT_PRINCIPAL}\nEmail: {cleaned}")
        return parse_ai_json(response.text)
    except Exception as e:
        print(f"Erro na IA: {e}")
        raise HTTPException(status_code=500, detail="Erro ao processar análise de texto.")

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_content = await file.read()
        # Envio multimodal direto (PDF/Txt)
        response = model.generate_content([
            PROMPT_PRINCIPAL,
            {'mime_type': file.content_type, 'data': file_content}
        ])
        return parse_ai_json(response.text)
    except Exception as e:
        print(f"Erro Multimodal: {e}")
        raise HTTPException(status_code=500, detail="Falha ao processar arquivo multimodal.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)