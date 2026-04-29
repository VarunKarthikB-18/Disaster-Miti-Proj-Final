import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Settings, X, Key } from 'lucide-react';

export function ChatPanel({ isActive }) {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your AI Disaster Assistant powered by Gemini. I can help you navigate to shelters, provide emergency protocols, and answer disaster-related questions. What do you need?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || "");
  const [showSettings, setShowSettings] = useState(false);
  const [keyInput, setKeyInput] = useState(apiKey);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const saveApiKey = () => {
    setApiKey(keyInput);
    localStorage.setItem('gemini_api_key', keyInput);
    setShowSettings(false);
    setMessages(prev => [...prev, { text: "API key saved! I'm now powered by Google Gemini AI. Ask me anything about disaster management!", sender: "bot" }]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, sender: "user" }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, api_key: apiKey })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { text: data.reply, sender: "bot" }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "Connection error. Cannot reach AI server.", sender: "bot" }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isActive) return null;

  return (
    <div className="absolute bottom-20 left-0 right-0 h-[60vh] bg-[#111]/95 backdrop-blur-xl border-t border-white/10 z-20 flex flex-col rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] slide-up">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Disaster AI Assistant</h3>
            <p className="text-[10px] text-green-400 font-mono">
              {apiKey ? "● Gemini AI Active" : "● Offline Mode"}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)} 
          className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
          title="API Settings"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-5 py-3 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2 mb-2">
            <Key size={14} className="text-yellow-400" />
            <span className="text-xs text-gray-300 font-semibold">Gemini API Key</span>
          </div>
          <div className="flex gap-2">
            <input 
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Paste your free Gemini API key..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
            />
            <button onClick={saveApiKey} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
              Save
            </button>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            Get a free key from <a href="https://aistudio.google.com/apikey" target="_blank" className="text-blue-400 underline">Google AI Studio</a>
          </p>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-blue-600 text-white rounded-br-sm' 
                : 'bg-white/8 text-white/90 border border-white/5 rounded-bl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/8 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="px-5 py-3 border-t border-white/10 bg-black/40 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about disasters, shelters, first aid..." 
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 transition-colors"
        />
        <button 
          type="submit"
          disabled={!input.trim()}
          className="w-10 h-10 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-xl flex items-center justify-center text-white transition-colors shrink-0"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
