import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";
import fetch from "node-fetch";

const { Client, LocalAuth } = pkg;

// 🔒 Lista de números autorizados (DDI + DDD + número)
const NUMEROS_AUTORIZADOS = [
  "5512988651997",
  "556196182809",
  "556195976862"  // Outro número (exemplo)
];

// ⏱️ Controle de tempo (1 minuto por número)
const ultimoEnvio = new Map();

// 🔑 Sua chave Groq (coloque aqui)
const GROQ_API_KEY = process.env.GROQ_API_KEY || "SUA_CHHAVE_AQUI";

// Função para gerar resposta com LLaMA 3 via Groq API
async function responderComGroq(prompt) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant", 
      messages: [
        {
          role: "system",
          content: "Você é o BotCaffê, um assistente com a personalidade de um filho gentil, carinhoso e atencioso. Fale sempre com educação, cuidado e proximidade, como alguém que quer ajudar a mãe/pai/família. Use frases acolhedoras, responda com empatia, dê atenção aos sentimentos do usuário e ofereça ajuda sempre que puder.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 200,
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content.trim();
}

// Inicializa cliente WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// Exibe QR Code
client.on("qr", (qr) => {
  console.log("📱 Escaneie este QR Code com o WhatsApp:");
  qrcode.generate(qr, { small: true });
});

// Bot pronto
client.on("ready", () => {
  console.log("✅ BotCaffê (LLaMA 3) conectado e pronto ☕");
});

// Mensagem recebida
client.on("message", async (message) => {
  const numero = message.from.replace("@c.us", "");
  const texto = message.body.trim();
  const agora = Date.now();

  console.log(`📩 ${numero}: "${texto}"`);

  const autorizado = NUMEROS_AUTORIZADOS.some((num) => numero.includes(num));
  if (!autorizado) return;

  const ultimo = ultimoEnvio.get(numero) || 0;
  const passouUmMinuto = agora - ultimo >= 60 * 1000;
  if (!passouUmMinuto) {
    console.log(`⏳ Ignorado (anti-spam): ${(agora - ultimo) / 1000}s desde última resposta`);
    return;
  }

  try {
    const resposta = await responderComGroq(texto);
    await message.reply(resposta);
    console.log(`💬 Respondido para ${numero}: "${resposta}"`);
    ultimoEnvio.set(numero, agora);
  } catch (err) {
    console.error("❌ Erro ao gerar resposta:", err.message);
    await message.reply("⚠️ Opa, tive um problema técnico. Tente novamente em instantes.");
  }
});

client.initialize();
