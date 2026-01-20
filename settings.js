import fs from "fs";
import chalk from "chalk";
import { fileURLToPath, pathToFileURL } from "url";
const env = {
  owner: [6287892083741],
  ownerName: "Z7:林企业",
  nameBot: "FIREFLY",
  packname: "Firefly",
  author: "Z7:林企业",
  botnumber: "6281234036052",
  idSaluran: "120363422508702325@newsletter",
  thumb: "https://b.top4top.io/p_35710vorl1.jpg",
  apikey: "FIREFLY",
  googleAiApiKey: "AIzaSyCDzhosCdX1F3PgwJW3jzubU37DX5xD2lU",
  maxTextLength: 5000,
  maxMentions: 35,
  blockUrls: true,
  detectToxicity: true,
  defaultLimit: 100,
  defaultAvatar: "https://cdn.yupra.my.id/yp/fr22acl0.jpg",
  defaultBg: "https://cdn.yupra.my.id/yp/j6s47112.jpg",
  footer: "_© Lightweight WhatsApp Bot by Rey_",
};
export default env;
const __filename = fileURLToPath(import.meta.url);
async function notifyOwner(conn) {
  try {
    if (!conn || !conn.sendMessage) return;
    for (const id of env.owner) {
      const jid = id + "@s.whatsapp.net";
      await conn.sendMessage(jid, {
        text: `✅ *settings.js telah diperbarui!*\nBot otomatis menerapkan konfigurasi terbaru.`,
      });
    }
  } catch (e) {
    console.log(chalk.redBright("❌ Gagal mengirim notifikasi ke owner:"), e);
  }
}
fs.watchFile(__filename, async () => {
  fs.unwatchFile(__filename);
  console.log(chalk.greenBright(`🔄 File "${__filename}" telah diperbarui!`));
  try {
    const updatedEnv = await import(`${pathToFileURL(__filename).href}?update=${Date.now()}`);
    Object.keys(env).forEach((key) => delete env[key]);
    Object.assign(env, updatedEnv.default);
    console.log(chalk.blueBright("✅ settings.js berhasil di-reload!"));
    if (global.conn) await notifyOwner(global.conn);
  } catch (err) {
    console.error(chalk.redBright("❌ Gagal me-reload settings.js:"), err);
  }
});
