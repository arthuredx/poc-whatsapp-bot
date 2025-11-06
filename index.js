import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

// 🔒 Número autorizado (formato internacional: DDI + DDD + número, sem + ou espaços)
// Exemplo: (11) 91234-5678 → "5511912345678"
const NUMEROS_AUTORIZADOS = [
  "5512988651997", // Número 1
  "556196182809"
]; // <-- coloque o número que deve receber resposta


// Inicializa o cliente com autenticação local
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true, // mude para false se quiser ver o navegador abrindo
  },
});

// Mostra QR Code para conectar
client.on("qr", (qr) => {
  console.log("📱 Escaneie este QR Code com o WhatsApp:");
  qrcode.generate(qr, { small: true });
});

// Quando logar com sucesso
client.on("ready", () => {
  console.log("✅ Bot conectado com sucesso!");
});

// Quando receber mensagem
client.on("message", async (message) => {
  // Log simples
  //console.log(`📩 Mensagem de ${message.from}: ${message.body}`);

  // Verifica se o número está na lista de autorizados
  const autorizado = NUMEROS_AUTORIZADOS.some((num) =>
    message.from.includes(num)
  );

  if (autorizado) {
    console.log("🟢 Mensagem de número autorizado detectada.");

    // Responde automaticamente qualquer mensagem
    const resposta = `Recebi sua mensagem vou ver quando puder agora me deixa em paz 🤖`;
    await message.reply(resposta);

    console.log("💬 Resposta enviada com sucesso.");
  }
});

// Inicializa o bot
client.initialize();