import React, { useState, useEffect } from 'react';
import { useSocket } from '../socket/SocketContext';
import '../ui/UnreadMessageNotification.css';

interface LastMessage {
  senderId: string;
  name: string;
  imgUrl: string;
  message: string;
  createdAt: string;
}

const UnreadMessageNotification: React.FC = () => {
  const { hasUnreadMessages, lastMessages } = useSocket();
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide after 5 seconds
  useEffect(() => {
    if (hasUnreadMessages && lastMessages.length > 0) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [hasUnreadMessages, lastMessages]);

  // Handle close button click
  const handleClose = () => {
    setIsVisible(false);
  };

  if (!hasUnreadMessages || lastMessages.length === 0 || !isVisible) {
    return null;
  }

  return (
    <div className="unread-notification-container">
      <button className="close-button" onClick={handleClose}>
        ×
      </button>
      <h3>New Unread Messages</h3>
      <ul className="message-list">
        {lastMessages.map((msg, index) => (
          <li key={index} className="message-item">
            <img
              src={msg.imgUrl || 'https://example.com/default_profile.jpg'}
              alt={`${msg.name}'s Profile`}
              className="sender-profile-img"
              onError={(e) => {
                e.currentTarget.src = 'https://example.com/default_profile.jpg';
              }}
            />
            <div className="message-sender">Sender: {msg.name}</div>
            <div className="message-content">Message: {msg.message}</div>
            <div className="message-time">
              Time: {new Date(msg.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UnreadMessageNotification;