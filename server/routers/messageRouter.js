const express = require('express');
const router = express.Router();
const { getsUser, getMessages,updateSeenMessage ,  saveMessage } = require('../controllers/messageController');
const { protect  } = require('../auth/authMiddleware');

router.get('/messages/:senderId/:receiverId', protect, getMessages);
// router.post('/', protect, saveMessage);
router.get('/user', protect, getsUser);
router.patch('/seen/:id', protect, updateSeenMessage);

module.exports = router;
