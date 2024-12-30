const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '../diagonalasis.db');

const initializeDb = async () => {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
    });
    return db;
};

module.exports = { initializeDb };
