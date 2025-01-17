const socket = io();

// Elementos do DOM
const postsContainer = document.getElementById('posts');
const postForm = document.getElementById('postForm');
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('message');
const typingIndicator = document.getElementById('typingIndicator');

// Função para gerar uma cor baseada no nome do usuário
function generateColorFromUsername(username) {
    // Gera um valor hash simples baseado no nome do usuário
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Garante que a cor será um valor entre 0 e 255
    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = hash & 0x0000FF;
    return `rgb(${r % 256}, ${g % 256}, ${b % 256})`; // Converte para uma cor RGB
}

// Função para renderizar os posts
function renderPosts(posts) {
    postsContainer.innerHTML = ''; // Limpa o container
    posts.forEach((post) => {
        const postElement = document.createElement('div');
        postElement.classList.add('message', post.type); // 'sent' ou 'received'
        
        const userColor = generateColorFromUsername(post.username); // Gera a cor baseada no nome do usuário

        postElement.innerHTML = `
            <strong style="color: white;">${post.username}</strong>: ${post.message}
        `;
        
        postElement.style.backgroundColor = userColor; // Altera a cor do balão de mensagem
        postsContainer.appendChild(postElement);
    });

    // Scroll para o fundo da lista de mensagens
    postsContainer.scrollTop = postsContainer.scrollHeight;
}

// Envia um novo post ao servidor
postForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = usernameInput.value.trim() || 'Usuário';
    const message = messageInput.value.trim();

    if (message) {
        // Cria a postagem com tipo 'sent' para a mensagem enviada
        const post = { username, message, type: 'sent' };

        // Emite a mensagem ao servidor
        socket.emit('newPost', post);

        // Exibe a mensagem localmente
        renderPosts([{ username, message, type: 'sent' }]);

        // Limpar o campo de mensagem após o envio
        messageInput.value = '';
    }
});

// Função para exibir o indicador de "Digitando"
let typingTimeout;
messageInput.addEventListener('input', () => {
    const username = usernameInput.value.trim() || 'Usuário';

    clearTimeout(typingTimeout);

    // Mostra o indicador de "Digitando"
    typingIndicator.style.display = 'block';
    typingIndicator.textContent = `${username} está digitando...`;

    // Envia o evento de "digitando" para o servidor
    socket.emit('typing', { isTyping: true, username });

    // Configura um temporizador para esconder o indicador de "Digitando" após 1.5 segundos sem digitação
    typingTimeout = setTimeout(() => {
        typingIndicator.style.display = 'none';
        socket.emit('typing', { isTyping: false, username }); // Indica que parou de digitar
    }, 1500);
});

// Atualiza os posts em tempo real
socket.on('updatePosts', (posts) => {
    renderPosts(posts);
});

// Exibe o status de "Digitando" dos outros usuários
socket.on('typingStatus', (data) => {
    const { isTyping, username } = data;

    if (isTyping) {
        typingIndicator.style.display = 'block';
        typingIndicator.textContent = `${username} está digitando...`;
    } else {
        typingIndicator.style.display = 'none';
    }
});