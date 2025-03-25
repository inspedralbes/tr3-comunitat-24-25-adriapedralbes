const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const { authenticateJWT } = require('../middleware/auth');

// Aplicar autenticación a todas las rutas
router.use(authenticateJWT);

// Obtener todas las conversaciones para el usuario actual
router.get('/conversations', async (req, res) => {
  try {
    const conversations = await Message.getUserConversations(req.user.id);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener conversaciones', error: error.message });
  }
});

// Obtener conversación con un usuario específico
router.get('/conversation/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    
    const messages = await Message.getConversation(req.user.id, userId, limit, skip);
    
    // Marcar mensajes como leídos
    await Message.updateMany(
      { sender: userId, recipient: req.user.id, read: false },
      { read: true }
    );
    
    res.json(messages.reverse()); // Invertir para obtener orden cronológico
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener conversación', error: error.message });
  }
});

// Marcar mensaje como leído
router.patch('/read/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    
    // Verificar si el mensaje existe y el usuario es el destinatario
    if (!message) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }
    
    if (message.recipient !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado para marcar este mensaje como leído' });
    }
    
    message.read = true;
    await message.save();
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error al marcar mensaje como leído', error: error.message });
  }
});

module.exports = router;
