// server.js
import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDB, getMessageCollection } from './db.js';
import viewsRouter from './routers/viewsrouter.js';

dotenv.config();

// __dirname para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helpers
function formatDate() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Funciones de base de datos
async function insertarMensaje(doc) {
  try {
    const col = getMessageCollection();
    await col.insertOne(doc);
    console.log('Mensaje insertado en MongoDB');
  } catch (err) {
    console.error('Error insertando mensaje:', err);
  }
}

async function enviarTodosLosMensajes(socket) {
  try {
    const col = getMessageCollection();
    const docs = await col.find().toArray();
    socket.emit('message', docs);
    console.log('Mensajes enviados al cliente');
  } catch (err) {
    console.error('Error al recuperar mensajes:', err);
  }
}

// Configuración de Express
const app = express();
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use(express.json()); // por si necesitas POST/PUT en el futuro

app.use('/', viewsRouter);

const PORT = process.env.PORT || 8080;

(async () => {
  // 1. Conectar DB
  await initDB();

  // 2. Arrancar server HTTP y Socket.IO
  const httpServer = app.listen(PORT, () =>
    console.log(`🚀 Servidor escuchando en puerto ${PORT}`)
  );
  const io = new Server(httpServer);

  // 3. Manejo de conexiones WebSocket
  io.on('connection', socket => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

    socket.on('identificarse', async userId => {
      await enviarTodosLosMensajes(socket);
      socket.broadcast.emit('user_event', {
        id: userId,
        data: 'Conectado',
        date: formatDate()
      });
    });

    socket.on('message', async (text, userId) => {
      const msg = { id: userId, data: text, date: formatDate() };
      await insertarMensaje(msg);
      io.emit('message', [msg]);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Cliente desconectado: ${socket.id}`);
      socket.broadcast.emit('user_event', {
        id: socket.id,
        data: 'Desconectado',
        date: formatDate()
      });
    });
  });
})();
