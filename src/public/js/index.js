// /public/js/index.js

const socket = io();

// Elementos del DOM
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const msgInput = document.getElementById('msg');

let user = '';

// Mostrar alerta para identificar usuario
Swal.fire({
  title: 'Identificarse',
  input: 'text',
  text: 'Ingresa tu nombre de usuario para el chat',
  inputValidator: (value) => {
    return !value && 'Necesitas escribir un nombre de usuario';
  },
  allowOutsideClick: false,
  allowEscapeKey: false,
  toast: false
}).then(result => {
  user = result.value;

  socket.emit('identificarse', user);

  // Escucha de mensajes broadcast (conexiones y desconexiones)
  socket.on('mensaje_servidor_broadcast', (data) => {
    outputMessage({
      id: data.id,
      data: data.data,
      date: data.date,
      system: true // Para darle otro estilo
    });
  });

  // Escucha de mensajes normales
  socket.on('message', (messages) => {
    messages.forEach(msg => outputMessage(msg));
  });

  // Evento enviar mensaje
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const messageText = msgInput.value.trim();
    if (messageText) {
      socket.emit('message', messageText, user);
      msgInput.value = '';
      msgInput.focus();
    }
  });

  // Evento al cerrar la ventana
  window.addEventListener('beforeunload', () => {
    socket.emit('disconnection', user);
  });
});

// Función para agregar mensaje al chat
function outputMessage({ id, data, date, system = false }) {
  const div = document.createElement('div');
  div.classList.add('message');
  if (system) {
    div.classList.add('system-message');
    div.innerHTML = `<p class="meta">${id} <span>${data} ${date}</span></p>`;
  } else {
    div.innerHTML = `<p class="meta">${id} <span>${date}</span></p>
                     <p class="text">${data}</p>`;
  }
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
