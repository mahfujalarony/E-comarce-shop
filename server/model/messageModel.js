const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  senderId: { type: String, ref: 'User', required: true },
  receiverId: { type: String, ref: 'User', required: true },
  message: { type: String, required: true },
  seen: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
messageSchema.index({ receiverId: 1, seen: 1 });
module.exports = mongoose.model('Message', messageSchema);



// const messageSchema = new mongoose.Schema({
//     senderId: { type: String, required: true },
//     receiverId: { type: String, required: true },
//     message: { type: String, required: true },
//     seen: { type: Boolean, default: false },
//     timestamp: { type: Date, default: Date.now },
//     }, { timestamps: true });

// const Message = mongoose.model('Message', messageSchema);

// module.exports = Message;