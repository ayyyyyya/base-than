export default {
    command: ['menu', 'help'],
    execute: async (sock, m) => {
        const menuText = `*LIST MENU BOT*\n\n- /sticker\n- /ping\n- /menu`;
        await sock.sendMessage(m.key.remoteJid, { text: menuText });
    }
};
