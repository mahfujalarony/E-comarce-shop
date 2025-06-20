const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User' },
  receiverType: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  message: { type: String, required: true },
  seen: { type: Boolean, default: false },
  productInfo: {
    productId: { type: String  },
    name: { type: String },
    image: { type: String },
    price: { type: Number }
  }
}, { timestamps: true }); // createdAt, updatedAt auto

messageSchema.index({ receiverId: 1, seen: 1 });

module.exports = mongoose.model('Message', messageSchema);