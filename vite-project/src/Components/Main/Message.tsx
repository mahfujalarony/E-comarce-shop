import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import socket from '../../socket';
import { useAuth } from '../auth/AuthContext';
import { useSocket } from '../socket/SocketContext';

interface Message {
  _id?: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt?: string;
  seen?: boolean;
}

interface User {
  userId: string;
  username: string;
  imgUrl: string;
  role: string;
}

const Messages: React.FC = () => {
  const [receiverId, setReceiverId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [unseenMessages, setUnseenMessages] = useState<Set<string>>(new Set());
  
  // ✅ Auto-scroll state management
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const lastMessageCountRef = useRef(0);
  
  // ✅ Tracking refs for preventing excessive calls
  const hasInitializedRef = useRef(false);
  const currentReceiverRef = useRef<string | null>(null);
  

  const { authData } = useAuth();
  const { onlineUsers, unreadMessagesBySender, refreshUnreadCount } = useSocket();
  const senderId = authData.userId;

  // ✅ Scroll to bottom function
  const scrollToBottom = useCallback((force = false) => {
    if (force || (shouldAutoScroll && isNearBottom)) {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [shouldAutoScroll, isNearBottom]);

  // ✅ Check if user is near bottom of messages
  const checkIfNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return false;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Consider "near bottom" if within 100px of bottom
    return distanceFromBottom < 100;
  }, []);

 
  const handleScroll = useCallback(() => {
    const isNear = checkIfNearBottom();
    setIsNearBottom(isNear);
    setShouldAutoScroll(isNear);
  }, [checkIfNearBottom]);

  // ✅ Memoized refresh function
  const memoizedRefreshUnreadCount = useCallback((userId: string) => {
    if (!userId || !hasInitializedRef.current) return;
    refreshUnreadCount(userId);
  }, [refreshUnreadCount]);

  // Fetch users with React Query
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      const response = await fetch('http://localhost:3001/api/message/user', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch messages with React Query
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', senderId, receiverId],
    queryFn: async (): Promise<Message[]> => {
      if (!senderId || !receiverId) return [];

      const response = await fetch(
        `http://localhost:3001/api/message/messages/${senderId}/${receiverId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          method: 'GET',
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      return response.json();
    },
    enabled: !!(senderId && receiverId),
    staleTime: 30 * 1000, // 30 seconds
  });

  // ✅ Auto scroll when messages change
  useEffect(() => {
    const currentMessageCount = messages.length;
    const hasNewMessages = currentMessageCount > lastMessageCountRef.current;
    
    if (hasNewMessages && !messagesLoading) {
      // If messages just loaded for first time or user sent a message, force scroll
      if (lastMessageCountRef.current === 0 || shouldAutoScroll) {
        setTimeout(() => scrollToBottom(true), 100);
      }
    }
    
    lastMessageCountRef.current = currentMessageCount;
  }, [messages, messagesLoading, scrollToBottom, shouldAutoScroll]);

  // ✅ Set default user selection (optimized)
  useEffect(() => {
    if (users.length > 0 && !receiverId) {
      const firstUserId = users[0].userId;
      setReceiverId(firstUserId);
      currentReceiverRef.current = firstUserId;
      // Reset scroll state when switching users
      setShouldAutoScroll(true);
      setIsNearBottom(true);
      lastMessageCountRef.current = 0;
    }
  }, [users, receiverId]);

  // ✅ Socket room management (optimized)
  useEffect(() => {
    if (senderId && receiverId && receiverId !== currentReceiverRef.current) {
      currentReceiverRef.current = receiverId;
      
      const roomId = [senderId, receiverId].sort().join('_');
      socket.emit('joinRoom', roomId);

      // Reset scroll state when switching users
      setShouldAutoScroll(true);
      setIsNearBottom(true);
      lastMessageCountRef.current = 0;

      // Force refetch messages when switching users
      queryClient.invalidateQueries({
        queryKey: ['messages', senderId, receiverId],
      });

      // Refresh unread count for new conversation
      setTimeout(() => {
        if (hasInitializedRef.current) {
          memoizedRefreshUnreadCount(senderId);
        }
      }, 500);
    }
  }, [senderId, receiverId, queryClient, memoizedRefreshUnreadCount]);

  // ✅ Initial unread count fetch (একবার মাত্র)
  useEffect(() => {
    if (senderId && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      setTimeout(() => {
        refreshUnreadCount(senderId);
      }, 1000); // একটু delay দিয়ে initial load করুন
    }
  }, [senderId, refreshUnreadCount]);

  // ✅ Socket connection debug (optimized)
  useEffect(() => {
    let mounted = true;

    const handleConnect = () => {
      if (mounted) console.log('Socket connected successfully');
    };
    
    const handleDisconnect = () => {
      if (mounted) console.log('Socket disconnected');
    };

    if (socket.connected) {
      console.log('Socket already connected');
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      mounted = false;
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  // ✅ Listen for new messages (optimized)
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      // Update query cache for both directions
      const updateCache = (sId: string, rId: string) => {
        queryClient.setQueryData(
          ['messages', sId, rId],
          (oldMessages: Message[] = []) => {
            if (oldMessages.some((msg) => msg._id === message._id)) {
              return oldMessages;
            }
            return [...oldMessages, message];
          }
        );
      };

      updateCache(message.senderId, message.receiverId);
      updateCache(message.receiverId, message.senderId);

      // ✅ Auto scroll for new messages if user is near bottom
      if (shouldAutoScroll || isNearBottom) {
        setTimeout(() => scrollToBottom(true), 100);
      }

      // ✅ নতুন মেসেজ এলে unread count refresh করুন (debounced)
      setTimeout(() => {
        if (senderId && hasInitializedRef.current) {
          memoizedRefreshUnreadCount(senderId);
        }
      }, 1000);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('receiveMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('receiveMessage', handleNewMessage);
    };
  }, [queryClient, senderId, memoizedRefreshUnreadCount, shouldAutoScroll, isNearBottom, scrollToBottom]);

  // ✅ Listen for message seen updates (optimized)
  useEffect(() => {
    const handleMessageSeenUpdate = ({ messageId, seen }: { messageId: string; seen: boolean }) => {
      console.log('Received messageSeenUpdate:', { messageId, seen });
      
      // Update both query caches
      const updateBothCaches = () => {
        if (!senderId || !receiverId) return;
        
        const updateCache = (sId: string, rId: string) => {
          queryClient.setQueryData(
            ['messages', sId, rId],
            (oldMessages: Message[] = []) => {
              return oldMessages.map((msg) =>
                msg._id === messageId ? { ...msg, seen } : msg
              );
            }
          );
        };

        updateCache(senderId, receiverId);
        updateCache(receiverId, senderId);
      };

      updateBothCaches();

      // ✅ Seen update এর পর unread count refresh (debounced)
      setTimeout(() => {
        if (senderId && hasInitializedRef.current) {
          memoizedRefreshUnreadCount(senderId);
        }
      }, 1500);
    };

    socket.on('messageSeenUpdate', handleMessageSeenUpdate);

    return () => {
      socket.off('messageSeenUpdate', handleMessageSeenUpdate);
    };
  }, [queryClient, senderId, receiverId, memoizedRefreshUnreadCount]);

  // ✅ Mark message as seen (optimized)
  const markMessageAsSeen = useCallback(async (messageId: string) => {
    if (!messageId || !receiverId || !senderId || unseenMessages.has(messageId)) return;

    try {
      setUnseenMessages((prev) => new Set([...prev, messageId]));

      socket.emit('messageSeen', { 
        messageId, 
        senderId: receiverId, // যে মেসেজ পাঠিয়েছে
        receiverId: senderId  // যে মেসেজ দেখছে
      });
      
      console.log('Emitted messageSeen event:', { 
        messageId, 
        senderId: receiverId, 
        receiverId: senderId 
      });
    } catch (error) {
      console.error('Error marking message as seen:', error);
    }
  }, [receiverId, senderId, unseenMessages]);

  // ✅ Component for individual message (memoized)
  const MessageItem = React.memo<{ msg: Message }>(({ msg }) => {
    const { ref, inView } = useInView({
      threshold: 0.5,
      triggerOnce: true,
    });

    useEffect(() => {
      if (inView && msg._id && msg.senderId !== senderId && !msg.seen) {
        markMessageAsSeen(msg._id);
      }
    }, [inView, msg._id, msg.seen, msg.senderId]);

    return (
      <div ref={ref} className={`flex ${msg.senderId === senderId ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`p-3 rounded-lg max-w-xs md:max-w-md shadow-sm ${
            msg.senderId === senderId
              ? 'bg-blue-500 text-white rounded-br-sm'
              : 'bg-white border border-gray-200 rounded-bl-sm'
          }`}
        >
          <p className="text-sm">{msg.message}</p>
          <div
            className={`text-xs mt-1 flex items-center justify-between ${
              msg.senderId === senderId ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            <span>
              {msg.createdAt &&
                new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
            </span>
          </div>
        </div>

        {/* Seen/unseen checkmark */}
        {msg.senderId === senderId && (
          <span className="ml-2 flex items-center space-x-0.5">
            {msg.seen ? (
              <>
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <svg className="w-4 h-4 text-blue-500 -ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            ) : (
              <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
        )}
      </div>
    );
  });

  // ✅ Send message (optimized)
  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !receiverId || !senderId) return;

    const messageData = {
      senderId,
      receiverId,
      message: newMessage,
    };

    setNewMessage('');
    
    // Auto scroll when user sends message
    setShouldAutoScroll(true);
    setIsNearBottom(true);

    socket.emit('sendMessage', messageData, (response: { status: string; error?: string; message?: Message }) => {
      if (response.status === 'success') {
        console.log('Message sent successfully');
        if (response.message) {
          queryClient.setQueryData(
            ['messages', senderId, receiverId],
            (oldMessages: Message[] = []) => {
              if (oldMessages.some((msg) => msg._id === response.message?._id)) {
                return oldMessages;
              }
              return [...oldMessages, response.message!];
            }
          );
          // Force scroll after sending message
          setTimeout(() => scrollToBottom(true), 100);
        }
      } else {
        console.error('Error sending message:', response.error);
        setNewMessage(messageData.message);
      }
    });
  }, [newMessage, receiverId, senderId, queryClient, scrollToBottom]);

  // ✅ Handle user selection (optimized)
  const handleUserSelect = useCallback((userId: string) => {
    if (userId === receiverId) return; // Same user selected
    
    setReceiverId(userId);
    // Reset scroll state when switching users
    setShouldAutoScroll(true);
    setIsNearBottom(true);
    lastMessageCountRef.current = 0;
    
    // User change করার পর একটু পরে unread count refresh করুন
    setTimeout(() => {
      if (senderId && hasInitializedRef.current) {
        memoizedRefreshUnreadCount(senderId);
      }
    }, 1000);
  }, [receiverId, senderId, memoizedRefreshUnreadCount]);

  // ✅ Memoized helper functions
  const isUserOnline = useCallback((userId: string) => onlineUsers.includes(userId), [onlineUsers]);
  
  const selectedUser = useMemo(() => 
    users.find((u) => u.userId === receiverId), 
    [users, receiverId]
  );

  const filteredMessages = useMemo(() => messages, [messages]);

  return (
    <div className="h-[80vh] flex flex-col bg-gray-100">
      {/* Mobile horizontal user list */}
      <div className="md:hidden bg-white border-b border-gray-300 p-3">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {users.map((user) => (
            <div
              key={user.userId}
              className="relative flex-shrink-0"
              onMouseEnter={() => setHoveredUser(user.userId)}
              onMouseLeave={() => setHoveredUser(null)}
            >
              <div
                onClick={() => handleUserSelect(user.userId)}
                className={`relative cursor-pointer transition-all duration-200 ${
                  receiverId === user.userId
                    ? 'ring-2 ring-blue-500 ring-offset-2'
                    : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
                }`}
              >
                <img
                  src={user.imgUrl}
                  alt={user.username}
                  className="w-12 h-12 rounded-full"
                />
                {isUserOnline(user.userId) && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                )}

                {unreadMessagesBySender[user.userId] > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadMessagesBySender[user.userId] > 9 ? '9+' : unreadMessagesBySender[user.userId]}
                  </span>
                )}
              </div>

              {/* Tooltip */}
              {hoveredUser === user.userId && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
                  {user.username}
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        <div className="hidden md:block md:w-1/4 bg-white border-r border-gray-300 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Chats</h2>
          </div>
          <div className="p-2">
            {usersLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <ul className="space-y-1">
                {users.map((user) => (
                  <li
                    key={user.userId}
                    onClick={() => handleUserSelect(user.userId)}
                    className={`p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors duration-150 ${
                      receiverId === user.userId ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={user.imgUrl}
                          alt={user.username}
                          className="w-10 h-10 rounded-full"
                        />
                        {isUserOnline(user.userId) && (
                          <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                        {unreadMessagesBySender[user.userId] > 0 && (
                          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadMessagesBySender[user.userId] > 9 ? '9+' : unreadMessagesBySender[user.userId]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          {isUserOnline(user.userId) ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="bg-white p-4 border-b border-gray-300 flex items-center gap-3">
            {selectedUser && (
              <>
                <img
                  src={selectedUser.imgUrl}
                  alt={selectedUser.username}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h2 className="text-lg font-semibold">{selectedUser.username}</h2>
                  <p className="text-sm text-gray-500">
                    {isUserOnline(selectedUser.userId) ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Online
                      </span>
                    ) : (
                      'Offline'
                    )}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Messages area with scroll handling */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 p-4 overflow-y-auto bg-gray-50"
            onScroll={handleScroll}
          >
            {messagesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMessages.map((msg) => (
                  <MessageItem key={msg._id || Math.random().toString()} msg={msg} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Scroll to bottom button - appears when user scrolls up */}
            {!isNearBottom && (
              <button
                onClick={() => scrollToBottom(true)}
                className="fixed bottom-20 right-6 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-10"
                title="Scroll to bottom"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            )}
          </div>

          {/* Message input */}
          <div className="p-4 border-t border-gray-300 bg-white">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={!receiverId}
              />
              <button
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                onClick={handleSendMessage}
                disabled={!receiverId || !newMessage.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;