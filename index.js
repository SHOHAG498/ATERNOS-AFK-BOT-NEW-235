const bedrock = require('bedrock-protocol');
const express = require('express');

// Koyeb-এ সার্ভিস সচল রাখার জন্য এক্সপ্রেস ওয়েব সার্ভার
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('AFK Bot is alive!');
});

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

const serverOptions = {
  host: 'SRSHOHAG27.aternos.me',
  port: 19132,
  username: 'AFK_Bot',
  offline: true
};

function createBot() {
  console.log('Connecting to Aternos server...');
  const client = bedrock.createClient(serverOptions);

  client.on('join', () => {
    console.log('Bot successfully joined the server!');
  });

  client.on('spawn', () => {
    console.log('Bot spawned in the world. Starting AFK movement loop...');
    
    // প্রতি ২০ সেকেন্ড পর পর মুভমেন্ট পাঠানো যাতে কিক না করে
    setInterval(() => {
      try {
        client.queue('player_auth_input', {
          pitch: 0,
          yaw: Math.random() * 360,
          position: [0, 0, 0],
          move_vector: [0.1, 0],
          head_yaw: 0,
          input_data: 0,
          input_command: 0,
          player_epoch: 0,
          counter: 0
        });
        console.log('Sent movement packet to stay active.');
      } catch (err) {
        console.log('Movement skipped:', err.message);
      }
    }, 60000);
  });

  client.on('disconnect', (packet) => {
    console.log('Disconnected from server:', packet);
    reconnect();
  });

  client.on('error', (err) => {
    console.log('Client error occurred:', err);
  });

  client.on('close', () => {
    console.log('Connection closed.');
    reconnect();
  });
}

function reconnect() {
  console.log('Reconnecting in 10 seconds...');
  setTimeout(() => {
    createBot();
  }, 10000);
}

createBot();
                     
