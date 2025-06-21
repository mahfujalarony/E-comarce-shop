import React, { useState, useEffect, useMemo } from 'react';
import ChatList from './ChatList';
import ChatBox from './ChatBox';
import { useParams, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface ConversationType {
  id: string;
  name: string;
  user: {
    name: string;
    email: string;
    imgUrl: string;
    role: 'admin' | 'user';
    userId: string;
  };
}

const Message: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<ConversationType | null>(null);
  console.log('selectedConversation', selectedConversation);
  const { chatId } = useParams<{ chatId: string }>();
  const location = useLocation();

  useEffect(() => {
    if (chatId && location.state?.user) {
      const user = location.state.user;
      const name = location.state.name || '';
      setSelectedConversation({ id: chatId, name, user });
    } else {
      setSelectedConversation(null);
    }
  }, [chatId, location.state]);

  const stableConversation = useMemo(() => {
    return selectedConversation ? { ...selectedConversation } : null;
  }, [selectedConversation?.id, selectedConversation?.name, selectedConversation?.user]);

  return (
    <div className="flex flex-col md:flex-row h-[80vh] bg-gray-50">
      {/* Desktop Chat List - Fixed width */}
      <div className="hidden md:flex md:w-[350px] border-r border-gray-200 bg-white overflow-y-auto">
        <ChatList />
      </div>
      
      {/* Mobile View */}
      <div className="md:hidden w-full h-full">
        {!stableConversation ? (
          <ChatList />
        ) : (
          <div className="h-full flex flex-col">
            <button 
              onClick={() => setSelectedConversation(null)}
              className="p-2 bg-gray-100 flex items-center gap-2 border-b"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to chats</span>
            </button>
            <div className="flex-1 overflow-auto">
              <ChatBox conversation={stableConversation} />
            </div>
          </div>
        )}
      </div>
      
      {/* Desktop Chat Box - Flexible space */}
      <div className="hidden md:flex flex-1 min-w-0">
        {stableConversation ? (
          <div className="w-full h-full">
            <ChatBox conversation={stableConversation} />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-500 bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
              <p className="text-gray-400">Choose a chat from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;