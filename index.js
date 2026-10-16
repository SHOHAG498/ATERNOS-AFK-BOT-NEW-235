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
const SERVER_HOST = process.env.SERVER_HOST || 'srbedrock.falixsrv.me';
const SERVER_PORT = parseInt(process.env.SERVER_PORT || '29382');
const BOT_NAME = process.env.BOT_NAME || 'AGENT';

let bot = null;
let angle = 0; // বৃত্তাকার ঘোরার জন্য অ্যাঙ্গেল

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
        console.log("Bot spawned in Spectator mode! Starting circular movement and head rotation loop...");

        if (bot.afkInterval) clearInterval(bot.afkInterval);

        // বোট স্পন হওয়ার প্রথম পজিশন বা একটি নির্দিষ্ট সেন্টার পয়েন্ট (যেমন: 0, 64, 0)
        // পরবর্তীতে বোট তার আশপাশেই ঘুরবে
        let centerX = 0;
        let centerY = 64; // সার্ভারের উচ্চতা অনুযায়ী প্রয়োজনমতো পরিবর্তন করতে পারেন
        let centerZ = 0;
        let radius = 3;   // গোল বৃত্তের ব্যাসার্ধ (কতটুকু দূরত্বের মধ্যে ঘুরবে, এখানে ৩ ব্লক)

        bot.afkInterval = setInterval(() => {
            try {
                if (bot) {
                    // অ্যাঙ্গেল বৃদ্ধি করা যাতে গোল গোল ঘুরতে থাকে
                    angle += 0.5; 
                    if (angle >= 360) angle = 0;

                    // রেডিয়ানে রূপান্তর
                    let rad = (angle * Math.PI) / 180;

                    // সাইন-কোসাইন দিয়ে বৃত্তাকার পজিশন হিসাব করা
                    let targetX = centerX + (radius * Math.cos(rad));
                    let targetZ = centerZ + (radius * Math.sin(rad));

                    // মাথা বা ক্যামেরা ঘোরানোর জন্য Yaw এবং Pitch ক্যালকুলেশন
                    let yaw = (angle + 90) % 360; 
                    let pitch = Math.sin(rad) * 20; // মাথা হালকা উপরে-নিচে করবে

                    // বেডরক প্রোটোকলের স্পেকটেটর মুভমেন্ট প্যাকেট
                    bot.write('player_auth_input', {
                        pitch: pitch,
                        yaw: yaw,
                        position: { x: targetX, y: centerY, z: targetZ },
                        move_vector: { x: 0, z: 0 },
                        head_yaw: yaw,
                        input_data: 0,
                        input_mode: 0,
                        play_mode: 0,
                        interaction_model: 0,
                        gaze_direction: { x: 0, y: 0, z: 0 },
                        tick: 0,
                        delta: { x: 0, y: 0, z: 0 }
                    });

                    console.log(`Spectator bot moving in circle at X: ${targetX.toFixed(2)}, Z: ${targetZ.toFixed(2)} with rotating head.`);
                }
            } catch (err) {
                console.log("Spectator Circle Loop Error:", err.message);
            }
        }, 3000); // প্রতি ৩ সেকেন্ডে আপডেট হবে
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
