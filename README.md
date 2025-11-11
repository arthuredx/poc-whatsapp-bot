# 🤖 WhatsApp Auto Responder Bot

Um bot simples e pessoal para responder automaticamente mensagens recebidas no WhatsApp, utilizando a biblioteca [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js).

---

## 🚀 Funcionalidades

- Conecta-se ao seu WhatsApp via QR Code  
- Mantém a sessão salva (não precisa escanear toda vez)  
- Responde automaticamente **somente para números autorizados**  
- Loga todas as mensagens recebidas e respostas no terminal  
- Pode usar tanto a versao da OpenAi ou da LLaMA

---

## 🧰 Requisitos

- [Node.js](https://nodejs.org/) (versão 16 ou superior)  
- WhatsApp ativo em um smartphone  
- Ambiente configurado (ex: Visual Studio Code)
- conta e token da https://console.groq.com/keys api LLaMA ou OpenApi

Verifique se o Node está instalado:
```bash
node -v
npm -v
⚙️ Instalação
Clone este repositório ou crie a pasta do projeto:

bash
Copiar código
git clone https://github.com/seuusuario/whatsapp-bot.git
cd whatsapp-bot
Instale as dependências:

bash
Copiar código
npm install whatsapp-web.js qrcode-terminal
npm install node-fetch
🧩 Configuração
Abra o arquivo index.js

-- se for usar a integração com chatgpt precisa da chave e instalação do pacote
npm install openai
e 
export OPENAI_API_KEY="sua-chave-aqui"
(ou crie um arquivo .env e carregue com dotenv, se preferir)

Edite a lista de números autorizados no formato internacional (sem + ou espaços):

javascript
Copiar código
const NUMEROS_AUTORIZADOS = [
  "5511912345678", // Exemplo: DDI 55 (Brasil), DDD 11, número 91234-5678
  "5521987654321"
];
Salve o arquivo.

▶️ Como iniciar o bot
No terminal, execute:

bash
Copiar código
node index.js