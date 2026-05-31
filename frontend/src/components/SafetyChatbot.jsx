import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Shield } from 'lucide-react';
import { sendChatMessage } from '../services/api';

export default function SafetyChatbot({ source, destination }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "👋 **Hello! I am your SafePath AI Safety Assistant.**\n\nI can analyze streetlight illumination, find the closest police shields or 24/7 pharmacies, and recommend active transit routes. How can I help secure your journey tonight?",
      suggested: ["Are there police stations nearby?", "How is the streetlight density?", "Emergency contact info"]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    // Add user message
    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const response = await sendChatMessage(text, source, destination);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.reply,
        suggested: response.suggested_actions || []
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "⚠️ **Connection Error:** I was unable to connect to the safety server. Please ensure your backend container is active and try again.",
        suggested: []
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Process markdown-like formatting (bolding and italics)
  const formatText = (txt) => {
    return txt.split('\n').map((line, idx) => {
      const parts = line.split('**');
      const elements = parts.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={i} className="font-extrabold text-white">{part}</strong>;
        }
        const italicParts = part.split('*');
        return italicParts.map((sub, j) => {
          if (j % 2 === 1) {
            return <em key={j} className="italic text-purple-300">{sub}</em>;
          }
          return sub;
        });
      });
      return <div key={idx} className="mb-2 last:mb-0 leading-relaxed">{elements}</div>;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end">
      
      {/* 1. Chat Dialog Window */}
      {isOpen && (
        <div className="w-[360px] h-[500px] bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 transition-all duration-300 ease-out glass-panel animate-fade-in filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900/60 to-emerald-900/40 p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-purple-500/20 p-1.5 rounded-lg border border-purple-500/30 animate-pulse">
                <Shield className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                  SafePath AI Assistant
                </h3>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block mt-0.5">Online Safety Expert</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 hover:bg-slate-900 rounded-lg transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Streams */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3.5 bg-slate-950/40">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
              >
                {/* Bubble */}
                <div 
                  className={`p-3 rounded-2xl text-xs ${
                    msg.sender === 'user' 
                      ? 'bg-purple-600 text-white rounded-tr-none shadow-md shadow-purple-950/20' 
                      : 'bg-slate-900 border border-slate-800/80 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {formatText(msg.text)}
                </div>

                {/* Suggestions Tags */}
                {msg.sender === 'bot' && msg.suggested && msg.suggested.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {msg.suggested.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sug)}
                        className="text-[10px] bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full border border-purple-500/20 hover:border-purple-500/40 transition-all font-bold cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Loader */}
            {loading && (
              <div className="self-start flex flex-col gap-1 max-w-[80%]">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-3 border-t border-slate-850 bg-slate-950/80 shrink-0 flex gap-2"
          >
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about illumination, police shields..."
              className="flex-1 bg-slate-900 border border-slate-800 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500 transition-all"
            />
            <button 
              type="submit"
              disabled={loading || !inputText.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-850 disabled:text-slate-600 text-white p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 border border-purple-500/20 hover:border-purple-500/40 shadow-lg shadow-purple-900/10"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* 2. Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 filter drop-shadow-[0_0_15px_rgba(168,85,247,0.35)] flex items-center justify-center border border-purple-400/30 hover:border-purple-400/50 cursor-pointer relative group"
      >
        <MessageSquare className="w-6 h-6 transition-transform duration-300 group-hover:rotate-6" />
        
        {/* Pulsing indicator */}
        {!isOpen && (
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-slate-950"></span>
          </span>
        )}
      </button>

    </div>
  );
}
