import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";
import OpenAI from "openai";

const { Client, LocalAuth } = pkg;

// 🔒 Lista de números autorizados
const NUMEROS_AUTORIZADOS = [
  "5512988651997", // Arthur
  "556196182809",
  "556195976862"  // Outro número (exemplo)
];

// ⏱️ Controle de tempo por número (anti-spam)
const ultimoEnvio = new Map();

// 🤖 Cliente ChatGPT (usando OpenAI SDK)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Inicializa cliente do WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // Caminho do Chrome no macOS
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  },
});

// Mostra o QR Code
client.on("qr", (qr) => {
  console.log("📱 Escaneie este QR Code com o WhatsApp:");
  qrcode.generate(qr, { small: true });
});

// Quando o bot estiver conectado
client.on("ready", () => {
  console.log("✅ BotCaffê conectado e pronto para conversar ☕");
});

// Quando receber mensagem
client.on("message", async (message) => {
  const numero = message.from.replace("@c.us", "");
  const texto = message.body.trim();
  const agora = Date.now();

  // Log
  console.log(`📩 Mensagem de ${numero}: "${texto}"`);

  // Só responde se for número autorizado
  const autorizado = NUMEROS_AUTORIZADOS.some((num) => numero.includes(num));
  if (!autorizado) return;

  // Verifica o timer (1 min entre respostas)
  const ultimo = ultimoEnvio.get(numero) || 0;
  const passouUmMinuto = agora - ultimo >= 60 * 1000;
  if (!passouUmMinuto) {
    console.log(`⏳ Ignorado (anti-spam) — última resposta há ${(agora - ultimo) / 1000}s`);
    return;
  }

  try {
    // 🧠 Gera resposta inteligente com ChatGPT
    const prompt = `Você é o BotCaffê, um assistente amigável e informativo no WhatsApp. 
    Responda de forma natural, útil e simpática. A mensagem recebida foi: "${texto}".`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // rápido e leve; pode trocar por "gpt-4o" se quiser mais contexto
      messages: [
        { role: "system", content: "Você é um assistente do WhatsApp, amigável e direto." },
        { role: "user", content: texto }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    const resposta = completion.choices[0].message.content.trim();

    // Envia resposta no WhatsApp
    await message.reply(resposta);
    console.log(`💬 Resposta enviada para ${numero}: "${resposta}"`);

    // Atualiza o tempo do último envio
    ultimoEnvio.set(numero, agora);
  } catch (err) {
    console.error("❌ Erro ao gerar resposta:", err.message);
    await message.reply("⚠️ Opa, estou com um probleminha técnico agora. Tente novamente em instantes.");
  }
});

// Inicializa o bot
client.initialize();
