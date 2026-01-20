import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session_auth');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        browser: ['MyBot', 'Chrome', '1.0.0']
    });

    // 1. Loader Plugins
    const plugins = new Map();
    const pluginsPath = path.join(__dirname, 'plugins');
    
    if (!fs.existsSync(pluginsPath)) fs.mkdirSync(pluginsPath);

    const pluginFiles = fs.readdirSync(pluginsPath).filter(file => file.endsWith('.js'));
    for (const file of pluginFiles) {
        const plugin = await import(`./plugins/${file}`);
        plugins.set(file, plugin.default);
        console.log(`Successfully loaded: ${file}`);
    }

    // 2. Connection Update
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ Bot WhatsApp Terhubung!');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // 3. Messages Handler
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const body = m.message.conversation || m.message.extendedTextMessage?.text || '';
        const prefix = '/'; // Kamu bisa ganti prefix di sini
        const isCommand = body.startsWith(prefix);
        
        if (isCommand) {
            const args = body.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            // Cari command di dalam plugins
            for (const [fileName, plugin] of plugins) {
                if (plugin.command.includes(command)) {
                    try {
                        await plugin.execute(sock, m, { args, body });
                    } catch (err) {
                        console.error(`Error di plugin ${fileName}:`, err);
                    }
                }
            }
        }
    });
}

startBot();
