const { Database } = require('sqlite3');
const { open } = require('sqlite');

const joinChat = async (io, socket, username) => {
    socket.broadcast.emit('new user', username);

    const db = await open({
        filename: "chat.db",
        driver: Database
    });

    const messages = await db.all("SELECT * FROM chatlog ORDER BY id DESC LIMIT 50");
    socket.emit('receive chatlog', messages);

    await db.close();
};

const leaveChat = (io, socket, username) => {
    socket.broadcast.emit('user left', username);
};

const sendMessage = async (io, message) => {
    const { username, content } = message;

    const db = await open({
        filename: "chat.db",
        driver: Database
    });

    await db.run("INSERT INTO chatlog (username, content, timestamp) VALUES (?, ?, ?)", [username, content, new Date().toISOString()]);

    await db.close();

    io.emit('receive message', message);
};

module.exports = {
    joinChat,
    leaveChat,
    sendMessage
};
