import React, { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import socket from '../../socket';

interface SenderUnreadCount {
  [senderId: string]: number;
}

interface UnreadMessageData {
  status: 'success' | 'error';
  unreadCount: number;
  uniqueSenders: string[];
  senderCounts: { [senderId: string]: number };
  error?: string;
}

interface LastMessage {
  senderId: string;
  name: string;
  imgUrl: string;
  message: string;
  createdAt: string;
}

interface LastMessageData {
  status: 'success' | 'error';
  lastMessages: LastMessage[];
  error?: string;
}

interface SocketContextType {
  onlineUsers: string[];
  unreadMessagesBySender: SenderUnreadCount;
  totalUnreadCount: number;
  hasUnreadMessages: boolean;
  lastMessages: LastMessage[]; // নতুন স্টেট
  refreshUnreadCount: (userId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [unreadMessagesBySender, setUnreadMessagesBySender] = useState<SenderUnreadCount>({});
  const [lastMessages, setLastMessages] = useState<LastMessage[]>([]); // নতুন স্টেট
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshTimeRef = useRef<number>(0);
  const isRefreshingRef = useRef<boolean>(false);

  const totalUnreadCount = useMemo(() => {
    return Object.values(unreadMessagesBySender).reduce((total, count) => total + count, 0);
  }, [unreadMessagesBySender]);

  const hasUnreadMessages = useMemo(() => {
    return totalUnreadCount > 0;
  }, [totalUnreadCount]);

  const refreshUnreadCount = useCallback((userId: string) => {
    if (!userId) return;
    
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current;
    
    if (timeSinceLastRefresh < 500 || isRefreshingRef.current) {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      refreshTimeoutRef.current = setTimeout(() => {
        performRefresh(userId);
      }, 300);
      return;
    }
    
    performRefresh(userId);
  }, []);

  const performRefresh = useCallback((userId: string) => {
    if (isRefreshingRef.current) return;
    
    isRefreshingRef.current = true;
    lastRefreshTimeRef.current = Date.now();
    
    console.log('Refreshing unread count for user:', userId);
    socket.emit('unreadMessageBadge', userId);
    socket.emit('unreadLastMessageNotification', userId); // lastMessages রিফ্রেশ করুন
    
    setTimeout(() => {
      isRefreshingRef.current = false;
    }, 1000);
  }, []);

  useEffect(() => {
    const handleOnlineUsers = (users: string[]) => {
      setOnlineUsers(users);
      console.log('Online users in SocketContext:', users);
    };

    const handleUnreadBadge = (data: UnreadMessageData) => {
      if (data.status === 'success') {
        const senderCounts: SenderUnreadCount = {};
        data.uniqueSenders.forEach((senderId: string) => {
          senderCounts[senderId] = data.senderCounts[senderId] || 0;
        });
        
        setUnreadMessagesBySender(prevCounts => {
          const hasChanged = JSON.stringify(prevCounts) !== JSON.stringify(senderCounts);
          if (hasChanged) {
            console.log('Updated unread messages by sender:', senderCounts);
            console.log('Total unread count:', Object.values(senderCounts).reduce((total, count) => total + count, 0));
            return senderCounts;
          }
          return prevCounts;
        });
      } else {
        console.error('Unread badge error:', data.error);
      }
    };

    const handleLastMessage = ({ status, lastMessages, error }: LastMessageData) => {
      if (status === 'success') {
        setLastMessages(lastMessages); // lastMessages স্টেটে সেট করুন
        console.log('Last unread messages:', lastMessages);
      } else {
        console.error('Error in last unread message notification:', error);
      }
    };

    socket.on('onlineUsersUpdate', handleOnlineUsers);
    socket.on('unreadMessageBadgeUpdate', handleUnreadBadge);
    socket.on('unreadLastMessageNotificationUpdate', handleLastMessage);

    return () => {
      socket.off('onlineUsersUpdate', handleOnlineUsers);
      socket.off('unreadMessageBadgeUpdate', handleUnreadBadge);
      socket.off('unreadLastMessageNotificationUpdate', handleLastMessage);
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{
      onlineUsers,
      unreadMessagesBySender,
      totalUnreadCount,
      hasUnreadMessages,
      lastMessages, // কনটেক্সটে lastMessages পাঠান
      refreshUnreadCount
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};