const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true
  },
  recipient: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Crear un índice para consultas más rápidas sobre conversaciones
messageSchema.index({ sender: 1, recipient: 1 });

// Método para encontrar conversación entre dos usuarios
messageSchema.statics.getConversation = function(user1Id, user2Id, limit = 50, skip = 0) {
  return this.find({
    $or: [
      { sender: user1Id, recipient: user2Id },
      { sender: user2Id, recipient: user1Id }
    ]
  })
  .sort({ timestamp: -1 })
  .skip(skip)
  .limit(limit)
  .exec();
};

// Método para obtener todas las conversaciones de un usuario
messageSchema.statics.getUserConversations = async function(userId) {
  // Obtener usuarios distintos que han enviado mensajes a este usuario
  const sentTo = await this.distinct('recipient', { sender: userId });
  const receivedFrom = await this.distinct('sender', { recipient: userId });
  
  // Combinar y eliminar duplicados
  const conversationPartners = [...new Set([...sentTo, ...receivedFrom])];
  
  // Para cada compañero de conversación, obtener el último mensaje
  const conversations = await Promise.all(
    conversationPartners.map(async (partnerId) => {
      const latestMessage = await this.findOne({
        $or: [
          { sender: userId, recipient: partnerId },
          { sender: partnerId, recipient: userId }
        ]
      }).sort({ timestamp: -1 });
      
      // Contar mensajes no leídos
      const unreadCount = await this.countDocuments({
        sender: partnerId,
        recipient: userId,
        read: false
      });
      
      return {
        partnerId,
        latestMessage,
        unreadCount
      };
    })
  );
  
  return conversations;
};

module.exports = mongoose.model('Message', messageSchema);
