const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware para servir arquivos estáticos
app.use(express.static('public'));

// Array para armazenar os posts
let posts = [];

// Rota inicial
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Lida com conexões de WebSocket
io.on('connection', (socket) => {
    console.log('Um usuário conectado');

    // Envia posts existentes ao usuário conectado
    socket.emit('updatePosts', posts);

    // Lida com novos posts
    socket.on('newPost', (post) => {
        posts.push(post); // Adiciona o post ao array
        io.emit('updatePosts', posts); // Atualiza todos os clientes
    });

    // Lida com o status de "digitando"
    socket.on('typing', (data) => {
        const { isTyping, username } = data;
        socket.broadcast.emit('typingStatus', { isTyping, username }); // Envia o status para os outros usuários
    });

    socket.on('disconnect', () => {
        console.log('Um usuário desconectado');
    });
});

// Inicia o servidor
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});