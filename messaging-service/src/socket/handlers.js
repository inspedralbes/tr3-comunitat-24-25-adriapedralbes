const Message = require('../models/message');

const registerSocketHandlers = (io, socket, connectedUsers) => {
  // Manejar mensajes privados
  socket.on('private_message', async (data) => {
    try {
      const { recipientId, content } = data;
      
      if (!recipientId || !content) {
        return socket.emit('error', { message: 'Se requieren ID de destinatario y contenido' });
      }
      
      // Crear y guardar el mensaje
      const message = new Message({
        sender: socket.user.id,
        recipient: recipientId,
        content
      });
      
      await message.save();
      
      // Emitir el mensaje al remitente para confirmación
      socket.emit('message_sent', message);
      
      // Verificar si el destinatario está en línea
      const recipientSocketId = connectedUsers.get(recipientId);
      
      if (recipientSocketId) {
        // Emitir el mensaje al destinatario
        io.to(recipientSocketId).emit('new_message', {
          ...message.toObject(),
          senderUsername: socket.user.username
        });
      }
    } catch (error) {
      console.error('Error al enviar mensaje privado:', error);
      socket.emit('error', { message: 'Error al enviar mensaje' });
    }
  });
  
  // Manejar indicador de escritura
  socket.on('typing', (data) => {
    const { recipientId, isTyping } = data;
    
    // Obtener ID de socket del destinatario
    const recipientSocketId = connectedUsers.get(recipientId);
    
    if (recipientSocketId) {
      // Emitir estado de escritura al destinatario
      io.to(recipientSocketId).emit('user_typing', {
        userId: socket.user.id,
        username: socket.user.username,
        isTyping
      });
    }
  });
  
  // Manejar confirmaciones de lectura
  socket.on('mark_read', async (data) => {
    try {
      const { messageIds } = data;
      
      if (!messageIds || !Array.isArray(messageIds)) {
        return socket.emit('error', { message: 'Se requiere array de IDs de mensajes' });
      }
      
      // Actualizar mensajes para marcar como leídos
      await Message.updateMany(
        { 
          _id: { $in: messageIds },
          recipient: socket.user.id
        },
        { read: true }
      );
      
      // Obtener IDs de remitentes únicos de estos mensajes
      const messages = await Message.find({ _id: { $in: messageIds } });
      const senderIds = [...new Set(messages.map(msg => msg.sender))];
      
      // Notificar a los remitentes que los mensajes fueron leídos
      senderIds.forEach(senderId => {
        const senderSocketId = connectedUsers.get(senderId);
        
        if (senderSocketId) {
          io.to(senderSocketId).emit('messages_read', {
            userId: socket.user.id,
            messageIds: messages
              .filter(msg => msg.sender === senderId)
              .map(msg => msg._id)
          });
        }
      });
    } catch (error) {
      console.error('Error al marcar mensajes como leídos:', error);
      socket.emit('error', { message: 'Error al marcar mensajes como leídos' });
    }
  });
  
  // Obtener estado en línea de usuarios
  socket.on('get_online_status', (data) => {
    const { userIds } = data;
    
    if (!userIds || !Array.isArray(userIds)) {
      return socket.emit('error', { message: 'Se requiere array de IDs de usuarios' });
    }
    
    const onlineStatuses = userIds.reduce((statuses, userId) => {
      statuses[userId] = connectedUsers.has(userId) ? 'online' : 'offline';
      return statuses;
    }, {});
    
    socket.emit('online_status_list', onlineStatuses);
  });
};

module.exports = { registerSocketHandlers };
