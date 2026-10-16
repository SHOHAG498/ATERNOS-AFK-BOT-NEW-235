const bedrock = require('bedrock-protocol');
const http = require('http');

// ১. Render-এর জন্য ওয়েব সার্ভার (Port 10000)
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Minecraft Simple AFK Bot is running 24/7!\n');
}).listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

// ২. FalixNodes সার্ভারের তথ্য
const SERVER_HOST = process.env.SERVER_HOST || 'srbedrock.falixsrv.me';
const SERVER_PORT = parseInt(process.env.SERVER_PORT || '29382');
const BOT_NAME = process.env.BOT_NAME || 'AFK_Bot_247';

let bot = null;

function createBot() {
    console.log(`Connecting to Minecraft server ${SERVER_HOST}:${SERVER_PORT}...`);

    bot = bedrock.createClient({
        host: SERVER_HOST,
        port: SERVER_PORT,
        username: BOT_NAME,
        offline: true,
        skipPing: true
    });

    bot.on('spawn', () => {
        console.log("Bot successfully connected and online in the server!");
    });

    bot.on('close', () => {
        console.log("Connection closed. Reconnecting in 10 seconds...");
        cleanupAndReconnect();
    });

    bot.on('error', (err) => {
        console.log("Client error:", err.message);
        cleanupAndReconnect();
    });
}

function cleanupAndReconnect() {
    if (bot) {
        try {
            bot.removeAllListeners();
            bot.end();
        } catch (e) {}
        bot = null;
    }
    setTimeout(createBot, 10000);
}

createBot();
