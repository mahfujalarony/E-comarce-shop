const Message = require('../model/messageModel');
const User = require('../model/UserModel');

const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on('connection', (socket) => {
   // console.log('User connected: ' + socket.id);

    const userId = socket.handshake.query.userId;
    if (userId && userId !== 'undefined' && !onlineUsers.has(userId)) {
      onlineUsers.set(userId, socket.id);
      socket.join(userId);
     // console.log(`User ${userId} mapped to socket ${socket.id}`);
      io.emit('onlineUsersUpdate', Array.from(onlineUsers.keys()));
    }

    // Join a room
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Handle message seen event - UPDATED
    socket.on('messageSeen', async ({ messageId, senderId, receiverId }) => {
      try {
        const updatedMessage = await Message.findByIdAndUpdate(
          messageId,
          { $set: { seen: true } },
          { new: true }
        );

        if (updatedMessage) {
          const roomId = [senderId, receiverId].sort().join('_');
          io.to(roomId).emit('messageSeenUpdate', {
            messageId,
            seen: true,
          });
          console.log(`Message ${messageId} marked as seen and broadcasted to room ${roomId}`);

          // ✅ receiver এর জন্য updated unread count পাঠান
          if (onlineUsers.has(receiverId)) {
            const unreadMessages = await Message.find({
              receiverId: receiverId,
              seen: false,
            }).select('senderId');

            // প্রতি সেন্ডারের অপঠিত মেসেজ গণনা
            const senderCounts = {};
            unreadMessages.forEach((msg) => {
              senderCounts[msg.senderId] = (senderCounts[msg.senderId] || 0) + 1;
            });

            const uniqueSenders = Object.keys(senderCounts);
            const unreadCount = unreadMessages.length;

            io.to(onlineUsers.get(receiverId)).emit('unreadMessageBadgeUpdate', {
              status: 'success',
              unreadCount,
              uniqueSenders,
              senderCounts,
            });

            //console.log(`Updated unread count for user ${receiverId}: ${unreadCount}`);
          }
        }
      } catch (error) {
        console.error('Error handling message seen:', error);
        socket.emit('messageSeenError', { error: 'Failed to mark message as seen' });
      }
    });

    // Notification for unread message per user
    socket.on('unreadMessageBadge', async (userId) => {
      try {
        if (!userId || !onlineUsers.has(userId)) {
          socket.emit('unreadMessageBadgeUpdate', {
            status: 'error',
            error: 'User not found or offline',
          });
          return;
        }

        const unreadMessages = await Message.find({
          receiverId: userId,
          seen: false,
        }).select('senderId');

        // প্রতি সেন্ডারের অপঠিত মেসেজ গণনা
        const senderCounts = {};
        unreadMessages.forEach((msg) => {
          senderCounts[msg.senderId] = (senderCounts[msg.senderId] || 0) + 1;
        });

        const uniqueSenders = Object.keys(senderCounts);
        const unreadCount = unreadMessages.length;

        io.to(onlineUsers.get(userId)).emit('unreadMessageBadgeUpdate', {
          status: 'success',
          unreadCount,
          uniqueSenders,
          senderCounts, // প্রতি সেন্ডারের মেসেজ সংখ্যা
        });

        //console.log(`Unread messages for user ${userId}: ${unreadCount}, unique senders: ${uniqueSenders.length}`);
      } catch (error) {
        console.error('Error fetching unread messages:', error);
        socket.emit('unreadMessageBadgeUpdate', {
          status: 'error',
          error: 'Failed to fetch unread messages',
        });
      }
    });

    // Notification for last unread message per online user
    // socket.on('unreadLastMessageNotification', async (userId) => {
    //   try {
    //     if (!userId || !onlineUsers.has(userId)) {
    //       socket.emit('unreadLastMessageNotificationUpdate', {
    //         status: 'error',
    //         error: 'User not found or offline',
    //       });
    //       return;
    //     }

    //     const unreadMessages = await Message.find({
    //       receiverId: userId,
    //       seen: false,
    //     })
    //       .sort({ createdAt: -1 })
    //       .select('senderId message createdAt')
    //       .populate('senderId', 'name imgUrl');

    //     const lastMessagesBySender = {};
    //     unreadMessages.forEach((msg) => {
    //       if (!lastMessagesBySender[msg.senderId]) {
    //         lastMessagesBySender[msg.senderId] = {
    //           senderId: msg.senderId,
    //           message: msg.message,
    //           createdAt: msg.createdAt,
    //         };
    //       }
    //     });

    //     const lastMessages = Object.values(lastMessagesBySender);

    //     io.to(onlineUsers.get(userId)).emit('unreadLastMessageNotificationUpdate', {
    //       status: 'success',
    //       lastMessages,
    //     });

    //     console.log(`Last unread messages for user ${userId}: ${lastMessages.length} notifications sent`);
    //   } catch (error) {
    //     console.error('Error fetching last unread messages:', error);
    //     socket.emit('unreadLastMessageNotificationUpdate', {
    //       status: 'error',
    //       error: 'Failed to fetch last unread messages',
    //     });
    //   }
    // });

    socket.on('unreadLastMessageNotification', async (userId) => {
  try {
    if (!userId || !onlineUsers.has(userId)) {
      socket.emit('unreadLastMessageNotificationUpdate', {
        status: 'error',
        error: 'User not found or offline',
      });
      return;
    }

    const unreadMessages = await Message.find({
      receiverId: userId,
      seen: false,
    })
      .sort({ createdAt: -1 })
      .select('senderId message createdAt')
      .populate('senderId', 'name imgUrl'); // User মডেল থেকে name এবং imgUrl আনুন

    const lastMessagesBySender = {};
    unreadMessages.forEach((msg) => {
      if (!lastMessagesBySender[msg.senderId._id]) {
        lastMessagesBySender[msg.senderId._id] = {
          senderId: msg.senderId._id, // senderId._id ব্যবহার করুন
          name: msg.senderId.name || 'Unknown User', // name ফিল্ড যোগ করুন
          imgUrl: msg.senderId.imgUrl || 'https://example.com/default_profile.jpg', // imgUrl ফিল্ড যোগ করুন
          message: msg.message,
          createdAt: msg.createdAt,
        };
      }
    });

    const lastMessages = Object.values(lastMessagesBySender);

    io.to(onlineUsers.get(userId)).emit('unreadLastMessageNotificationUpdate', {
      status: 'success',
      lastMessages,
    });

    //console.log(`Last unread messages for user ${userId}: ${lastMessages.length} notifications sent`);
  } catch (error) {
    console.error('Error fetching last unread messages:', error);
    socket.emit('unreadLastMessageNotificationUpdate', {
      status: 'error',
      error: 'Failed to fetch last unread messages',
    });
  }
});

    // Send a message to a specific room
    // socket.on('sendMessage', async ({ senderId, receiverId, message }, callback) => {
    //   try {
    //     const roomId = [senderId, receiverId].sort().join('_');
    //     const newMessage = new Message({ senderId, receiverId, message });
    //     await newMessage.save();

    //     io.to(roomId).emit('receiveMessage', newMessage);

    //     // Trigger unread message badge update for receiver
    //     if (onlineUsers.has(receiverId)) {
    //       const unreadMessages = await Message.find({
    //         receiverId,
    //         seen: false,
    //       }).select('senderId');

    //       const senderCounts = {};
    //       unreadMessages.forEach((msg) => {
    //         senderCounts[msg.senderId] = (senderCounts[msg.senderId] || 0) + 1;
    //       });

    //       const uniqueSenders = Object.keys(senderCounts);
    //       const unreadCount = unreadMessages.length;

    //       io.to(onlineUsers.get(receiverId)).emit('unreadMessageBadgeUpdate', {
    //         status: 'success',
    //         unreadCount,
    //         uniqueSenders,
    //         senderCounts,
    //       });

    //       const lastUnreadMessage = await Message.findOne({
    //         receiverId,
    //         seen: false,
    //       })
    //         .sort({ createdAt: -1 })
    //         .select('senderId message createdAt');

    //       if (lastUnreadMessage) {
    //         io.to(onlineUsers.get(receiverId)).emit('unreadLastMessageNotificationUpdate', {
    //           status: 'success',
    //           lastMessages: [
    //             {
    //               senderId: lastUnreadMessage.senderId,
    //               message: lastUnreadMessage.message,
    //               createdAt: lastUnreadMessage.createdAt,
    //             },
    //           ],
    //         });
    //       }
    //     }

    //     if (typeof callback === 'function') {
    //       callback({ status: 'success', message: newMessage });
    //     }
    //   } catch (error) {
    //     console.error('Error saving message:', error);
    //     if (typeof callback === 'function') {
    //       callback({ status: 'error', error: 'Failed to send message' });
    //     }
    //   }
    // });

    // Send a message to a specific room
socket.on('sendMessage', async ({ senderId, receiverId, message }, callback) => {
  try {
    const roomId = [senderId, receiverId].sort().join('_');
    const newMessage = new Message({ senderId, receiverId, message });
    await newMessage.save();

    io.to(roomId).emit('receiveMessage', newMessage);

    // Trigger unread message badge update for receiver
    if (onlineUsers.has(receiverId)) {
      const unreadMessages = await Message.find({
        receiverId,
        seen: false,
      }).select('senderId');

      const senderCounts = {};
      unreadMessages.forEach((msg) => {
        senderCounts[msg.senderId] = (senderCounts[msg.senderId] || 0) + 1;
      });

      const uniqueSenders = Object.keys(senderCounts);
      const unreadCount = unreadMessages.length;

      io.to(onlineUsers.get(receiverId)).emit('unreadMessageBadgeUpdate', {
        status: 'success',
        unreadCount,
        uniqueSenders,
        senderCounts,
      });

      const lastUnreadMessage = await Message.findOne({
        receiverId,
        seen: false,
      })
        .sort({ createdAt: -1 })
        .select('senderId message createdAt')
        .populate('senderId', 'name imgUrl'); // name এবং imgUrl পপুলেট করুন

      if (lastUnreadMessage) {
        io.to(onlineUsers.get(receiverId)).emit('unreadLastMessageNotificationUpdate', {
          status: 'success',
          lastMessages: [
            {
              senderId: lastUnreadMessage.senderId._id, // _id ব্যবহার করুন
              name: lastUnreadMessage.senderId.name || 'Unknown User', // name যোগ করুন
              imgUrl: lastUnreadMessage.senderId.imgUrl || 'https://example.com/default_profile.jpg', // imgUrl যোগ করুন
              message: lastUnreadMessage.message,
              createdAt: lastUnreadMessage.createdAt,
            },
          ],
        });
      }
    }

    if (typeof callback === 'function') {
      callback({ status: 'success', message: newMessage });
    }
  } catch (error) {
    console.error('Error saving message:', error);
    if (typeof callback === 'function') {
      callback({ status: 'error', error: 'Failed to send message' });
    }
  }
});

    // User offline event
    socket.on('userOffline', (userId) => {
      onlineUsers.delete(userId);
      //console.log(`User ${userId} is offline. Online users: ${onlineUsers.size}`);
      io.emit('onlineUsersUpdate', Array.from(onlineUsers.keys()));
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected: ' + socket.id);
      for (let [userId, socketId] of onlineUsers) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} is offline. Online users: ${onlineUsers.size}`);
          io.emit('onlineUsersUpdate', Array.from(onlineUsers.keys()));
          break;
        }
      }
    });
  });
};

module.exports = socketHandler;