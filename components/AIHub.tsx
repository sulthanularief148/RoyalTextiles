import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Loader2, Upload, X, MessageSquare, ScanLine } from 'lucide-react';
import { chatWithGemini, analyzeImageWithGemini, fileToBase64 } from '../services/geminiService';
import { ChatMessage } from '../types';

const AIHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'analyze'>('chat');
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I am BusyBot. How can I assist you with your textile shop today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Image Analysis State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isChatLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsChatLoading(true);

    try {
      // Build history for context (last 5 turns)
      const history = messages.slice(-5).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await chatWithGemini(userMsg.text, history);
      
      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Sorry, I'm having trouble connecting right now.", timestamp: new Date(), isError: true }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setImageFile(file);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile || !selectedImage) return;

    setIsAnalyzing(true);
    try {
      const base64 = await fileToBase64(imageFile);
      const result = await analyzeImageWithGemini(base64, imageFile.type);
      setAnalysisResult(result);
    } catch (error) {
      setAnalysisResult("Error analyzing image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    setAnalysisResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Gemini AI</span> Hub
        </h2>
        <p className="text-gray-500">Your intelligent assistant for business insights and fabric analysis.</p>
      </header>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-all ${
            activeTab === 'chat' 
              ? 'bg-white shadow-md text-blue-600 border border-blue-100 ring-2 ring-blue-500/10' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <MessageSquare size={20} />
          <span>BusyBot Chat</span>
        </button>
        <button
          onClick={() => setActiveTab('analyze')}
          className={`px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-all ${
            activeTab === 'analyze' 
              ? 'bg-white shadow-md text-purple-600 border border-purple-100 ring-2 ring-purple-500/10' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <ScanLine size={20} />
          <span>Fabric Analyzer</span>
        </button>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  } ${msg.isError ? 'bg-red-50 text-red-600 border-red-200' : ''}`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    <span className={`text-[10px] block mt-2 opacity-70 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm flex items-center gap-2">
                    <Loader2 className="animate-spin text-blue-600" size={16} />
                    <span className="text-sm text-gray-500">BusyBot is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-3 max-w-4xl mx-auto">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about inventory, sales trends, or fabrics..."
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isChatLoading}
                  className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analyze Tab */}
        {activeTab === 'analyze' && (
          <div className="h-full flex flex-col md:flex-row">
            <div className="flex-1 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50">
              {!selectedImage ? (
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                    <ImageIcon size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Upload Fabric Image</h3>
                  <p className="text-gray-500 mb-6 max-w-xs mx-auto">Upload a photo of a fabric or item to analyze its material, pattern, and color.</p>
                  <label className="bg-purple-600 text-white px-6 py-3 rounded-xl cursor-pointer hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto w-fit">
                    <Upload size={18} />
                    <span>Select Image</span>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
              ) : (
                <div className="w-full max-w-md">
                   <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200 mb-6">
                     <img src={selectedImage} alt="Analysis Target" className="w-full h-auto max-h-[400px] object-cover" />
                     <button 
                       onClick={resetImage}
                       className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                     >
                       <X size={16} />
                     </button>
                   </div>
                   {!analysisResult && (
                      <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <SparklesIcon size={20} />}
                        {isAnalyzing ? 'Analyzing with Gemini...' : 'Analyze Fabric'}
                      </button>
                   )}
                </div>
              )}
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto bg-white">
              {analysisResult ? (
                <div className="animate-fade-in">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <SparklesIcon className="text-purple-600" /> Analysis Result
                  </h3>
                  <div className="prose prose-purple max-w-none text-gray-600">
                     <div className="whitespace-pre-wrap p-4 bg-purple-50 rounded-xl border border-purple-100">
                       {analysisResult}
                     </div>
                  </div>
                  <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-sm text-yellow-800">
                     <strong>Tip:</strong> You can copy this information to add a new product in the Inventory section.
                  </div>
                  <button 
                    onClick={resetImage}
                    className="mt-6 text-purple-600 font-medium hover:underline"
                  >
                    Analyze another image
                  </button>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p className="text-center">
                    Results will appear here after analysis.<br/>
                    Powered by <strong>gemini-3-pro-preview</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SparklesIcon = ({ className, size=24 }: { className?: string, size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);

export default AIHub;