require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { initializeSocket } = require('./config/socket');
const { connectToDatabase } = require('./config/database');
const messageRoutes = require('./routes/messages');

// Inicializar Express
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Conectar a MongoDB
connectToDatabase();

// Inicializar Socket.io
initializeSocket(server);

// Rutas API
app.use('/api/messages', messageRoutes);

// Endpoint de verificación
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'tr3-messaging' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servicio de mensajería ejecutándose en el puerto ${PORT}`);
});
