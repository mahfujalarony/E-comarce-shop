const Message = require('../model/messageModel');
const User = require('../model/UserModel'); 



exports.getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    console.log('senderId', senderId, 'receiverId', receiverId);

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'Missing senderId or receiverId' });
    }

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });

    //update seen true when receiver open the chat
    await Message.updateMany(
      {
        senderId: receiverId,
        receiverId: senderId,
        seen: false,
      },
      { $set: { seen: true } }
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.saveMessage = async (req, res) => {
  const { senderId, receiverId, message } = req.body;
  console.log('req.body', req.body);
  console.log('sender', senderId, 'receiver', receiverId, 'message', message);
  const newMessage = new Message({ senderId, receiverId, message });
  await newMessage.save();
  res.status(201).json(newMessage);
};

exports.getsUser = async (req, res) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.user.id } },
      { _id: 1, name: 1, imgUrl: 1, role: 1 }
    );

    const formattedUsers = users.map((user) => ({
      userId: user._id,
      username: user.name,
      imgUrl: user.imgUrl,
      role: user.role,
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateSeenMessage = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating seen status for message ID:', id);

    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      { seen: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(updatedMessage);
  } catch (error) {
    console.error('Error updating seen message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


