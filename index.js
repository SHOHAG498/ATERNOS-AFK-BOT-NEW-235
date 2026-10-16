const bedrock = require('bedrock-protocol');
const http = require('http');

// ১. Render-এর জন্য ওয়েব সার্ভার (Port 10000)
const PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Spectator Circle Bot is running 24/7!\n');
}).listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

// ২. FalixNodes সার্ভারের তথ্য
const SERVER_HOST = process.env.SERVER_HOST || 'your-falix-ip.falixsrv.me';
const SERVER_PORT = parseInt(process.env.SERVER_PORT || '19132');
const BOT_NAME = process.env.BOT_NAME || 'AFK_Bot_247';

let bot = null;
let angle = 0;

function createBot() {
    console.log(`Connecting directly to Minecraft server ${SERVER_HOST}:${SERVER_PORT}...`);

    bot = bedrock.createClient({
        host: SERVER_HOST,
        port: SERVER_PORT,
        username: BOT_NAME,
        offline: true,
        skipPing: true
    });

    bot.on('spawn', () => {
        console.log("Bot spawned in Spectator mode! Starting error-free circular movement...");

        if (bot.afkInterval) clearInterval(bot.afkInterval);

        // বোট স্পন হওয়ার সঠিক শুরুর পজিশন ধরা (যদি না পাওয়া যায় তবে ডিফল্ট ০, ৬৪, ০)
        let basePos = { x: 0, y: 64, z: 0 };
        if (bot.entity && bot.entity.position) {
            basePos = { 
                x: bot.entity.position.x || 0, 
                y: bot.entity.position.y || 64, 
                z: bot.entity.position.z || 0 
            };
        }

        let radius = 2; // ২ ব্লকের ডায়ামিটারের মধ্যে ছোট বৃত্তে ঘুরবে

        bot.afkInterval = setInterval(() => {
            try {
                if (bot) {
                    angle = (angle + 10) % 360;
                    let rad = (angle * Math.PI) / 180;

                    let targetX = basePos.x + (radius * Math.cos(rad));
                    let targetZ = basePos.z + (radius * Math.sin(rad));
                    let yaw = (angle + 90) % 360;
                    let pitch = Math.sin(rad) * 15; // হাল্কা মাথা উপরে-নিচে করা

                    // bedrock-protocol এর ১০০% সঠিক অবজেক্ট স্ট্রাকচার (SizeOf error সমাধান)
                    bot.write('player_auth_input', {
                        pitch: pitch,
                        yaw: yaw,
                        position: { x: targetX, y: basePos.y, z: targetZ },
                        move_vector: { x: 0, z: 0 },
                        head_yaw: yaw,
                        input_data: 0,
                        input_mode: 0,
                        play_mode: 0,
                        interaction_model: 0,
                        gaze_direction: { x: 0, y: 0, z: 0 },
                        tick: 0,
                        delta: { x: 0, y: 0, z: 0 } // delta অবজেক্টে x, y, z প্রতিটি থাকা বাধ্যতামূলক
                    });

                    console.log(`[Spectator Active] Moving circle -> X: ${targetX.toFixed(2)}, Z: ${targetZ.toFixed(2)}`);
                }
            } catch (err) {
                console.log("Spectator Circle Loop Error:", err.message);
            }
        }, 3000); // প্রতি ৩ সেকেন্ডে আপডেট
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
        if (bot.afkInterval) clearInterval(bot.afkInterval);
        bot.removeAllListeners();
        bot = null;
    }
    setTimeout(createBot, 10000);
}

createBot();
