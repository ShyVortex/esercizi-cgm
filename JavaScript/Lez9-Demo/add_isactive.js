const fs = require('fs');
const { faker } = require('@faker-js/faker');

// 1. Leggi il file db.json attuale
const rawData = fs.readFileSync('db.json', 'utf-8');
const db = JSON.parse(rawData);

// 2. Funzione che aggiunge isActive
function addIsActive(array) {
    return array.map(item => ({
        ...item,
        isActive: faker.datatype.boolean({ probability: 1.0 })
    }));
}

// 3. Applica la modifica a tutte le tue collezioni
if (db.posts) db.posts = addIsActive(db.posts);
if (db.comments) db.comments = addIsActive(db.comments);
if (db.users) db.users = addIsActive(db.users);
if (db.roles) {
    db.roles = db.roles.map(role => ({ ...role, isActive: true }));
}

// 4. Salva il file aggiornato
fs.writeFileSync('db.json', JSON.stringify(db, null, 2));

console.log("Campo 'isActive' aggiunto con successo!");
console.log("Apri db.json per vedere i risultati.");