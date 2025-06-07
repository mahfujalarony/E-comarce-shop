import React, { useState, useEffect } from 'react';
import { useSocket } from '../socket/SocketContext';
import '../ui/UnreadMessageNotification.css';

// Define the shape of a message
interface LastMessage {
  senderId: string;
  name: string;
  imgUrl: string;
  message: string;
  createdAt: string;
}

// Define the return type of useSocket
interface SocketContext {
  hasUnreadMessages: boolean;
  lastMessages: LastMessage[];
}

const UnreadMessageNotification: React.FC = () => {
  const { hasUnreadMessages, lastMessages } = useSocket() as SocketContext;
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  // Auto-hide after 7 seconds
  useEffect(() => {
    if (hasUnreadMessages && lastMessages.length > 0) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [hasUnreadMessages, lastMessages]);

  // Handle close button click
  const handleClose = () => {
    setIsVisible(false);
  };

  // Handle dismiss all messages
  const handleDismissAll = () => {
    setIsVisible(false);
    setSelectedMessage(null);
  };

  // Toggle message details view
  const toggleMessageDetails = (messageId: string) => {
    setSelectedMessage(selectedMessage === messageId ? null : messageId);
  };

  if (!hasUnreadMessages || lastMessages.length === 0 || !isVisible) {
    return null;
  }

  return (
    <div
      className="unread-notification-container"
      role="alert"
      aria-live="polite"
    >
      <button
        className="close-button"
        onClick={handleClose}
        aria-label="Close notification"
      >
        ×
      </button>
      <div className="notification-header">
        <h3>New Unread Messages ({lastMessages.length})</h3>
        <button
          className="dismiss-all-button"
          onClick={handleDismissAll}
          aria-label="Dismiss all notifications"
        >
          Dismiss All
        </button>
      </div>
      <ul className="message-list">
        {lastMessages.map((msg: LastMessage, index: number) => (
          <li
            key={index}
            className={`message-item ${selectedMessage === msg.senderId ? 'selected' : ''}`}
            onClick={() => toggleMessageDetails(msg.senderId)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                toggleMessageDetails(msg.senderId);
              }
            }}
            aria-expanded={selectedMessage === msg.senderId}
          >
            <img
              src={msg.imgUrl || 'https://example.com/default_profile.jpg'}
              alt={`${msg.name}'s Profile`}
              className="sender-profile-img"
              onError={(e) => {
                e.currentTarget.src = 'https://example.com/default_profile.jpg';
              }}
            />
            <div className="message-info">
              <div className="message-sender">Sender: {msg.name}</div>
              <div className="message-content">
                Message:{' '}
                {msg.message.length > 50 && selectedMessage !== msg.senderId
                  ? `${msg.message.substring(0, 50)}...`
                  : msg.message}
              </div>
              <div className="message-time">
                Time:{' '}
                {new Date(msg.createdAt).toLocaleString('en-US', {
                  timeZone: 'Asia/Dhaka',
                })}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UnreadMessageNotification;