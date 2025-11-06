import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

// 🔒 Lista de números autorizados (formato: DDI + DDD + número, sem + ou espaços)
const NUMEROS_AUTORIZADOS = [
  "5512988651997"
];

// ⏱️ Controle de tempo por número
const ultimoEnvio = new Map(); // { numero: timestamp }

// Inicializa o cliente com autenticação local
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
  },
});

// Exibe o QR Code
client.on("qr", (qr) => {
  console.log("📱 Escaneie este QR Code com o WhatsApp:");
  qrcode.generate(qr, { small: true });
});

// Confirma login
client.on("ready", () => {
  console.log("✅ Bot conectado com sucesso!");
});

// Lida com mensagens recebidas
client.on("message", async (message) => {
  const numero = message.from.replace("@c.us", ""); // Extrai número
  const texto = message.body.trim();
  const agora = Date.now();

  // Log básico
  // console.log(`📩 Mensagem de ${numero}: "${texto}"`);

  // Verifica se o número é autorizado
  const autorizado = NUMEROS_AUTORIZADOS.some((num) => numero.includes(num));
  if (!autorizado) return; // ignora quem não está na lista

  // Verifica se passou 1 minuto desde a última resposta
  const ultimo = ultimoEnvio.get(numero) || 0;
  const passouUmMinuto = agora - ultimo >= 60 * 1000;

  if (passouUmMinuto) {
    // Monta resposta
    const resposta = `Recebi sua mensagem, quando puder respondo ! Por favor me deixe em paz! 🤖`;
    await message.reply(resposta);
    console.log(`💬 Resposta enviada para ${numero}`);
    ultimoEnvio.set(numero, agora); // atualiza timestamp
  } else {
    console.log(`⏳ Ignorado (anti-spam): última resposta há ${(agora - ultimo) / 1000}s`);
  }
});

// Inicializa o bot
client.initialize();
