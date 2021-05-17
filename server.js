/* eslint-disable no-undef */
require('dotenv/config');
const { Client } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors');
const socketIo = require('socket.io');
const http = require('http');
const PORT = process.env.PORT;
const fs = require('fs');
const mongoose = require('mongoose');
const qrcode = require('qrcode');
const { Session } = require('inspector');
const app = express();

// Handle Cors
let whitelist = [
  'http://localhost:3000'
]

let corsOption = {
  origin: function (origin, callback) {
    if(whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}

app.use(cors(corsOption));

// parse request application/json x-www-form-urlencode
app.use(express.json({limit: '20mb'}));
app.use(express.urlencoded({extended: true, limit: '20mb'}));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const SESSION_FILE_PATH = './whatsapp-session.json';
let sessionCfg;

if(fs.existsSync(SESSION_FILE_PATH)) {
  sessionCfg = require(SESSION_FILE_PATH);
}

// Initilalize Client
global.client = new Client({
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      // '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ]
  },
  session: sessionCfg
});

client.initialize();

io.on('connection', (socket) => {
  console.log("New client connected");
  socket.emit('message', 'connecting..');

  client.on('qr', (qr) => {
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit('qr', url);
      socket.emit('message', 'QR Code received, scan please!');
    });
  });

  client.on('ready', () => {
    socket.emit('ready', 'Whatsapp is ready!');
    socket.emit('message', 'Whatsapp is ready!');
  });

  client.on('authenticated', (session) => {
    socket.emit('authenticated', 'Whatsapp is authenticated!');
    socket.emit('message', 'Whatsapp is authenticated!');
    console.log('AUTHENTICATED', session);
    sessionCfg = Session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
      if(err) {
        console.log(err);
      }
    });
  });

  client.on('auth_failure', () => {
    socket.emit('message', 'Auth failure, restarting...');
  });

  client.on('disconnected', () => {
    socket.emit('message', 'Whatsapp is disconnedted!');
    fs.unlinkSync(SESSION_FILE_PATH, (err) => {
      if(err) return console.log(err);
      console.log('Session file deleted');
    });

    client.destroy();
    client.initialize();
  });
});

// Wapi Routes
require('./src/routes/wapi.routes')(app);

// Auth Routes
require('./src/routes/auth.routes')(app);

// Contact Routes
require('./src/routes/contact.routes')(app);

// Connect to DB
mongoose.connect(process.env.DB_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
let db = mongoose.connection;

db.on('error', console.error.bind(console, 'Database connect error!'));
db.once('open', () => {
  console.log('Database is connected');
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});