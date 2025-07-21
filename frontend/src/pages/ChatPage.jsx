import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ChatPage = ({ onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chat`,
        { query: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const aiMessage = { sender: 'ai', text: res.data.answer };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = { sender: 'ai', text: 'Sorry, I encountered an error.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <header className="flex justify-between items-center p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Nebula9 Knowledge Assistant</h1>
        <button onClick={onLogout} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">Logout</button>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && <div className="flex justify-start"><div className="p-3 bg-gray-700 rounded-lg">AI is thinking...</div></div>}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about company policy..."
            className="flex-1 px-4 py-2 bg-gray-800 rounded-md focus:outline-none"
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading} className="px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500">
            Send
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatPage;