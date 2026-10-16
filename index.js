const bedrock = require('bedrock-protocol');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('AFK Bot is Online!');
});

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

const serverOptions = {
  host: 'srbedrock.falixsrv.me',
  port: 29382,
  username: 'AFK_Bot',
  offline: true,
  skipPing: true,             // Aternos-এর ডিসকভারি পিং বাইপাস করবে
  connectTimeout: 60000       // কানেকশন টাইমআউট ৬০ সেকেন্ডে উন্নীত করা হলো
};

function createBot() {
  console.log('Connecting directly to Aternos server...');
  const client = bedrock.createClient(serverOptions);

  client.on('join', () => {
    console.log('Bot successfully joined the server!');
  });

  client.on('spawn', () => {
    console.log('Bot spawned in the world! Starting AFK loop...');
    
    // প্রতি ১৫ সেকেন্ডে ছোট মুভমেন্ট পাঠাবে কিক এড়াতে
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
        console.log('Movement packet error:', err.message);
      }
    }, 15000);
  });

  client.on('disconnect', (packet) => {
    console.log('Disconnected from server:', packet);
    reconnect();
  });

  client.on('error', (err) => {
    console.log('Client error:', err.message);
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
