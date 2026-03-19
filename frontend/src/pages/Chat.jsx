import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { chatApi } from '../api/chat';
import { offersApi } from '../api/offers';
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
  const scrollRef = useRef();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchInbox();
    if (listingId && otherUserId) {
      fetchConversation();
    }
  }, [listingId, otherUserId]);

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

    try {
      await chatApi.sendMessage({
        listingId,
        receiverId: otherUserId,
        content: newMessage
      });
      setNewMessage('');
      fetchConversation();
      toast.success('Message sent!');
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex gap-8 h-[calc(100vh-120px)]">
        {/* Inbox / Conversations List */}
        <div className="w-1/3 bg-white rounded-[2rem] shadow-premium border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-black text-gray-900">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {inbox.length > 0 ? inbox.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => navigate(`/chat?listingId=${item.LISTING_ID}&userId=${item.OTHER_USER_ID}&title=${item.TITLE}`)}
                className={`p-6 border-b border-gray-50 cursor-pointer transition-all hover:bg-primary/5 ${
                  listingId == item.LISTING_ID && otherUserId == item.OTHER_USER_ID ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                }`}
              >
                <p className="font-bold text-gray-900 truncate">{item.OTHER_USER_NAME}</p>
                <p className="text-sm text-gray-500 truncate mt-1">Re: {item.TITLE}</p>
              </div>
            )) : (
              <div className="p-10 text-center text-gray-400 font-bold">No messages yet</div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-[2rem] shadow-premium border border-gray-100 flex flex-col overflow-hidden">
          {listingId ? (
            <>
              <div className="p-6 border-b border-gray-100 bg-primary/5 flex items-center justify-between">
                <div>
                    <h3 className="font-black text-gray-900">{listingTitle || 'Chat'}</h3>
                    <p className="text-xs text-primary font-bold uppercase tracking-widest mt-1">Conversation with #{otherUserId}</p>
                </div>
                <button className="bg-white border border-primary/20 text-primary px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:border-primary transition-all">
                    View Listing
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30">
                {messages.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`flex ${msg.SENDER_ID == user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${
                      msg.SENDER_ID == user.id 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                    }`}>
                      <p className="leading-relaxed">{msg.CONTENT}</p>
                      <p className={`text-[10px] mt-2 opacity-70 ${msg.SENDER_ID == user.id ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.CREATED_AT).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-gray-100 flex gap-4">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white p-4 rounded-2xl shadow-lg shadow-primary/20 transition-all transform active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
              <div className="h-24 w-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">Select a conversation</h2>
              <p className="text-gray-500 max-w-sm">Choose a message from the sidebar to continue your discussion about a swap.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
