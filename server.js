const { Database } = require('sqlite3');
const { open } = require('sqlite');
const app = require('./app'); // Import Express.js application
const { Server } = require('socket.io');
const http = require('http');
const chatHandler = require('./handler/chat');

// Function to setup database if it doesn't exist; this will run on start
const setupDatabase = async () => {
    // Open accounts database
    const accDb = await open({
        filename: "accounts.db",
        driver: Database
    });

    // Create tables if they do not exist
    await accDb.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    `);
    await accDb.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session TEXT UNIQUE
        )
    `);
    await accDb.close(); // Close database

    // Open chat database
    const chatDb = await open({
        filename: "chat.db",
        driver: Database
    });

    // Create table for storing chat history
    await chatDb.run(`
        CREATE TABLE IF NOT EXISTS chatlog (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            content TEXT,
            timestamp TEXT
        )
    `);
    await chatDb.close();
};

setupDatabase();

const server = http.createServer(app); // Create HTTP server running Express.js application
const io = new Server(server); // Setup Socket.IO server
const clients = {}; // JSON of all connected clients


io.on('connection', socket => {
    socket.on('hello', username => {
        const usernames = Object.values(clients); // Get list of usernames
        socket.broadcast.emit('new user', username); // Notify all other clients that a new user has joined
        socket.emit('receive users', usernames); // Send updated user list to the new client
        chatHandler.joinChat(io, socket, username); // Handle joining chat
        clients[socket.id] = username; // Add new client to clients JSON
    });

    socket.on('disconnect', () => {
        const username = clients[socket.id]; // Get username
        if (username) {
            socket.broadcast.emit('user left', username); // Notify all other clients that a user has left
            chatHandler.leaveChat(io, socket, username); // Handle leaving chat
            delete clients[socket.id]; // Remove client from clients JSON
        }
    });

    socket.on('send message', message => {
        const timestamp = new Date().toLocaleString(); // Get current timestamp
        message.timestamp = timestamp; // Add timestamp to message object
        chatHandler.sendMessage(io, message); // Send message to all clients // Handle sending messages
    });
});

// Run HTTP server on port given by environment variable, or default to 8080
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
