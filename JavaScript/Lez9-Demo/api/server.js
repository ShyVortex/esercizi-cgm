const jsonServer = require('json-server');
const cors = require('cors');
const path = require('path');

const server = jsonServer.create();
// Il percorso punta al file db.json nella directory principale (una cartella sopra /api)
const router = jsonServer.router(path.join(__dirname, '../db.json'));
const middlewares = jsonServer.defaults();

server.use(cors());
server.use(jsonServer.bodyParser);
server.use(middlewares);

// Aggiungiamo /api come prefisso in modo che Vercel sappia dove far combaciare le route
server.use('/api', router);

// Necessario per Vercel Serverless
module.exports = server;
