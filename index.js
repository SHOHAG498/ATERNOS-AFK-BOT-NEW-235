const bedrock = require('bedrock-protocol');
const http = require('http');

// ১. Render-এর জন্য মিনিমাল ওয়েব সার্ভার (Port 10000)
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('AFK Bot is active and running 24/7!\n');
}).listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

// ২. আপনার সার্ভারের তথ্য
const SERVER_HOST = process.env.SERVER_HOST || 'srbedrock.falixsrv.me'; // আপনার Server IP
const SERVER_PORT = parseInt(process.env.SERVER_PORT || '29382');          // আপনার Server Port
const BOT_NAME = process.env.BOT_NAME || 'AFK_Bot_247';                     // বোটের নাম

let bot = null;

function createBot() {
    console.log(`Connecting directly to Minecraft server ${SERVER_HOST}:${SERVER_PORT}...`);

    bot = bedrock.createClient({
        host: SERVER_HOST,
        port: SERVER_PORT,
        username: BOT_NAME,
        offline: true,
        skipPing: true
    });

    // বোট সফলভাবে গেমে ঢুকলে
    bot.on('spawn', () => {
        console.log("Bot successfully spawned in the world! Starting clean AFK loop...");

        // ক্ষতিকর পজিশন প্যাকেটের বদলে নিরাপদ হাত নাড়ানো (Swing Arm) লুপ
        if (bot.afkInterval) clearInterval(bot.afkInterval);

        bot.afkInterval = setInterval(() => {
            try {
                if (bot && bot.entityId) {
                    // অ্যানিমেশন প্যাকেট পাঠানো (Swing Arm)
                    bot.write('animate', {
                        action_id: 1,
                        runtime_entity_id: bot.entityId
                    });
                    console.log("Sent AFK keep-alive packet (Swing Arm).");
                }
            } catch (err) {
                console.log("AFK Loop error:", err.message);
            }
        }, 20000); // প্রতি ২০ সেকেন্ডে একবার
    });

    // ডিসকানেক্ট বা এরর হলে স্বয়ংক্রিয়ভাবে আবার রিকানেক্ট করবে
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
        if (bot.afkInterval) clearInterval(bot.afkInterval);
        bot.removeAllListeners();
        bot = null;
    }
    setTimeout(createBot, 10000); // ১০ সেকেন্ড পর আবার কানেক্ট করবে
}

// বোট চালু করুন
createBot();
