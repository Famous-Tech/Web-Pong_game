const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const games = {};

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('createGame', () => {
        const code = Math.random().toString(36).substring(7);
        games[code] = {
            player1: socket.id,
            player2: null
        };
        socket.join(code);
        socket.emit('gameCreated', code);
    });

    socket.on('joinGame', (code) => {
        if (games[code] && !games[code].player2) {
            games[code].player2 = socket.id;
            socket.join(code);
            io.to(code).emit('gameJoined');
        } else {
            socket.emit('error', 'Partie non trouvée ou déjà pleine');
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(` YES ✅💫,Server running on port ${PORT}`));
