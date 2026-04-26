const jsonServer = require('json-server');
const fs = require('fs');
const path = require('path');

const server = jsonServer.create();
const middlewares = jsonServer.defaults();

// Trucco per Vercel: Copiamo il file db.json nella cartella /tmp che è scrivibile
const dbPath = path.join('/tmp', 'db.json');
if (!fs.existsSync(dbPath)) {
    fs.copyFileSync(path.join(__dirname, 'db.json'), dbPath);
}

const router = jsonServer.router(dbPath);

server.use(middlewares);
server.use('/api', router);

module.exports = server;