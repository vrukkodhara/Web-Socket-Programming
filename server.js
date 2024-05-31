const fs = require('fs');
const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();


app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "font-src 'self' data:; default-src 'self'");
  next();
});


app.use(express.static('public'));


const port = 3000;
const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

const wss = new WebSocket.Server({ server });

function readJsonFromFile(clientId) {
  const filePath = path.join(__dirname, `data_${clientId}.json`);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  } else {
    return { name: "", age: 0 };
  }
}

function writeJsonToFile(clientId, data) {
  const filePath = path.join(__dirname, `data_${clientId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}


wss.on('connection', (ws, req) => {
  const params = new URLSearchParams(req.url.split('?')[1]);
  const clientId = params.get('clientId');
  if (!clientId) {
    ws.close(1008, 'Client ID required');
    return;
  }

  console.log(`Client ${clientId} connected`);

  
  ws.send(JSON.stringify(readJsonFromFile(clientId)));


  ws.on('message', (message) => {
    console.log(`Received from ${clientId}: ${message}`);
    const data = JSON.parse(message);
    writeJsonToFile(clientId, data);
  });

  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected`);
  });
});
