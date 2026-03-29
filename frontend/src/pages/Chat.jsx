import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { chatApi } from '../api/chat';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const listingId = queryParams.get('listingId');
  const otherUserId = queryParams.get('userId');
  const listingTitle = queryParams.get('title');

  const [messages, setMessages] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const scrollRef = useRef();
  const user = JSON.parse(localStorage.getItem('user'));

  // Socket Connection Setup
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const newSocket = io('http://localhost:5000', {
        auth: { token }
    });
    setSocket(newSocket);

    newSocket.on('receive_message', (msg) => {
        setMessages(prev => {
            // Check to avoid duplicates
            if (!prev.find(m => m.ID === msg.ID)) {
                return [...prev, msg];
            }
            return prev;
        });
        fetchInbox(); // Keep sidebar updated
    });

    return () => newSocket.close();
  }, []);

  // Sync Room and History
  useEffect(() => {
    fetchInbox();
    if (listingId && otherUserId) {
      fetchConversation();
      if (socket) socket.emit('join_room', { listingId, otherUserId });
    }
  }, [listingId, otherUserId, socket]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchInbox = async () => {
    try {
      const res = await chatApi.getInbox();
      setInbox(res.data);
    } catch (err) {
      console.error('Error fetching inbox:', err);
    }
  };

  const fetchConversation = async () => {
    try {
      const res = await chatApi.getConversation(listingId, otherUserId);
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching conversation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (socket) {
      socket.emit('send_message', {
        listingId,
        receiverId: otherUserId,
        content: newMessage
      });
      setNewMessage('');
    } else {
      toast.error('Chat disconnected. Refresh page.');
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-950 flex flex-col transition-colors duration-300">
      <Navbar />
      
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex gap-8 h-[calc(100vh-120px)]">
        {/* Inbox / Conversations List */}
        <div className="w-1/3 bg-white dark:bg-gray-900 rounded-[2rem] shadow-premium dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden transition-colors duration-300">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {inbox.length > 0 ? inbox.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => navigate(`/chat?listingId=${item.LISTING_ID}&userId=${item.OTHER_USER_ID}&title=${item.TITLE}`)}
                className={`p-6 border-b border-gray-50 dark:border-gray-800/50 cursor-pointer transition-all hover:bg-primary/5 dark:hover:bg-primary/10 ${
                  listingId == item.LISTING_ID && otherUserId == item.OTHER_USER_ID ? 'bg-primary/10 dark:bg-primary/20 border-l-4 border-l-primary' : ''
                }`}
              >
                <p className="font-bold text-gray-900 dark:text-white truncate">{item.OTHER_USER_NAME}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">Re: {item.TITLE}</p>
              </div>
            )) : (
              <div className="p-10 text-center text-gray-400 font-bold">No messages yet</div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-[2rem] shadow-premium dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden transition-colors duration-300">
          {listingId ? (
            <>
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-primary/5 dark:bg-primary/10 flex items-center justify-between">
                <div>
                    <h3 className="font-black text-gray-900 dark:text-white">{listingTitle || 'Chat'}</h3>
                    <p className="text-xs text-primary dark:text-primary-light font-bold uppercase tracking-widest mt-1">Conversation with #{otherUserId}</p>
                </div>
                <button 
                    onClick={() => navigate(`/listings/${listingId}`)}
                    className="bg-white dark:bg-gray-950 border border-primary/20 dark:border-primary/40 text-primary dark:text-primary-light px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:border-primary transition-all"
                >
                    View Listing
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30 dark:bg-gray-950/30">
                {messages.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`flex ${msg.SENDER_ID == user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${
                      msg.SENDER_ID == user?.id 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                    }`}>
                      <p className="leading-relaxed">{msg.CONTENT}</p>
                      <p className={`text-[10px] mt-2 opacity-70 ${msg.SENDER_ID == user?.id ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.CREATED_AT).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-4">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white p-4 rounded-2xl shadow-lg shadow-primary/20 dark:shadow-none transition-all transform active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
              <div className="h-24 w-24 bg-primary/10 dark:bg-primary/20 rounded-[2rem] flex items-center justify-center mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Select a conversation</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">Choose a message from the sidebar to continue your discussion about a swap.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
