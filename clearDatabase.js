const { Database } = require('sqlite3');
const { open } = require('sqlite');

const clearDatabase = async () => {
    const db = await open({
        filename: 'chat.db',
        driver: Database
    });

    try {
        // Create tables if they do not exist
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password TEXT
            );

            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER,
                session TEXT UNIQUE
            );

            CREATE TABLE IF NOT EXISTS chatlog (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                content TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Clear the data from the tables
        await db.run('DELETE FROM users');
        await db.run('DELETE FROM sessions');
        await db.run('DELETE FROM chatlog');

        console.log('Database cleared successfully.');
    } catch (err) {
        console.error('Error clearing database:', err);
    } finally {
        await db.close();
    }
};

clearDatabase();
