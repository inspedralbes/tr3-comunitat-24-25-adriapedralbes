const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { registerSocketHandlers } = require('../socket/handlers');

// Mapa para rastrear usuarios conectados (userId -> socketId)
const connectedUsers = new Map();

const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Middleware de autenticación JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Error de autenticación: Token faltante'));
    }

    try {
      // Verificar token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = {
        id: decoded.user_id || decoded.id,
        username: decoded.username
      };
      next();
    } catch (error) {
      next(new Error('Error de autenticación: Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.user.username} (ID: ${socket.user.id})`);
    
    // Almacenar la conexión del socket del usuario
    connectedUsers.set(socket.user.id, socket.id);
    
    // Transmitir el estado en línea del usuario
    io.emit('user_status', { 
      userId: socket.user.id, 
      status: 'online' 
    });
    
    // Registrar manejadores de eventos
    registerSocketHandlers(io, socket, connectedUsers);
    
    // Manejar desconexión
    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${socket.user.username} (ID: ${socket.user.id})`);
      
      // Eliminar usuario del mapa de usuarios conectados
      connectedUsers.delete(socket.user.id);
      
      // Transmitir estado offline del usuario
      io.emit('user_status', { 
        userId: socket.user.id, 
        status: 'offline' 
      });
    });
  });

  return io;
};

module.exports = { initializeSocket };
