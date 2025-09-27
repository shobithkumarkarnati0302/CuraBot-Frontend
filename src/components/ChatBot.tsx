import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Volume2, VolumeX, Mic, MicOff, Globe, Image as ImageIcon, Trash2, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIChatService, { AIResponse } from '../services/aiChatService';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  language?: string;
  liked?: boolean;
  disliked?: boolean;
  confidence?: number;
  source?: 'ai' | 'knowledge_base' | 'fallback';
  suggestions?: string[];
  imageDataUrl?: string;
}

// Quick actions removed

const initialMessages: Message[] = [
  {
    id: '1',
    type: 'bot',
    content: 'Hello! I\'m your CuraBot assistant. How can I help you today?',
    timestamp: new Date(),
    source: 'fallback'
  }
];

const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [aiService] = useState(() => new AIChatService(import.meta.env.VITE_GEMINI_API_KEY));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<{ file: File; dataUrl: string } | null>(null);
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Customization states
  const [theme, setTheme] = useState<'light' | 'dark' | 'high-contrast'>('light');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [bubbleStyle, setBubbleStyle] = useState<'rounded' | 'square' | 'bubble'>('rounded');
  const [userAvatar, setUserAvatar] = useState<string>('U');
  const [botAvatar, setBotAvatar] = useState<string>('🤖');
  const [viewMode, setViewMode] = useState<'normal' | 'mini' | 'split'>('normal');

  // Quick actions removed

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  // Image selection handlers
  const handleSelectImageClick = () => fileInputRef.current?.click();
  const handleImageChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSelectedImage({ file, dataUrl });
    };
    reader.readAsDataURL(file);
  };
  const clearSelectedImage = () => setSelectedImage(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const playNotification = () => {
    if (soundEnabled && !isOpen) {
      notificationSound.play();
    }
  };

  const handleReaction = (messageId: string, reaction: 'like' | 'dislike') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          liked: reaction === 'like' ? !msg.liked : false,
          disliked: reaction === 'dislike' ? !msg.disliked : false,
        };
      }
      return msg;
    }));
  };

  // handleQuickAction removed

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      language: currentLanguage,
      imageDataUrl: selectedImage?.dataUrl
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    try {
      // Detect language if auto-detection is enabled
      const detectedLang = aiService.detectLanguage(messageText);
      if (detectedLang !== currentLanguage) {
        setCurrentLanguage(detectedLang);
        aiService.setLanguage(detectedLang);
      }

      // Get AI response (with optional image analysis)
      let aiResponse: AIResponse;
      if (selectedImage?.dataUrl) {
        aiResponse = await aiService.generateResponseWithImage(messageText, selectedImage.dataUrl);
      } else {
        aiResponse = await aiService.generateResponse(messageText);
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: aiResponse.message,
        timestamp: new Date(),
        language: currentLanguage,
        confidence: aiResponse.confidence,
        source: aiResponse.source,
        suggestions: aiResponse.suggestions
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Speak the response if TTS is enabled
      if (soundEnabled) {
        aiService.speak(aiResponse.message, currentLanguage);
      }
      
      playNotification();
      setSelectedImage(null);
    } catch (error) {
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date(),
        source: 'fallback'
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Voice input functionality
  const handleVoiceInput = async () => {
    if (isListening) {
      aiService.stopListening();
      setIsListening(false);
      return;
    }

    try {
      setIsListening(true);
      const transcript = await aiService.startListening();
      setInputMessage(transcript);
      setIsListening(false);
    } catch (error) {
      setIsListening(false);
    }
  };

  // Language change handler
  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    aiService.setLanguage(language);

    // Update greeting message in selected language using service translations
    const greeting = aiService.getGreeting(language);

    const greetingMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: greeting,
      timestamp: new Date(),
      language: language,
      source: 'fallback'
    };

    setMessages(prev => [...prev, greetingMessage]);
  };

  // Stop TTS
  const stopSpeaking = () => {
    aiService.stopSpeaking();
  };

  // Drag handlers for moveable chatbot
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen) return; // Don't drag when chat is open
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const newX = Math.max(0, Math.min(window.innerWidth - 64, e.clientX - dragOffset.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 64, e.clientY - dragOffset.y));
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add/remove global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Calculate popup position based on chatbot position
  // Theme and style helpers
  const getThemeClasses = () => {
    const base = {
      light: {
        bg: 'bg-gradient-to-br from-white to-gray-50',
        text: 'text-gray-800',
        border: 'border-gray-100',
        header: 'bg-gradient-to-r from-emerald-600 to-emerald-700',
        userBubble: 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white',
        botBubble: 'bg-white border border-gray-200 text-gray-800'
      },
      dark: {
        bg: 'bg-gradient-to-br from-gray-900 to-gray-800',
        text: 'text-gray-100',
        border: 'border-gray-700',
        header: 'bg-gradient-to-r from-emerald-700 to-emerald-800',
        userBubble: 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-white',
        botBubble: 'bg-gray-800 border border-gray-600 text-gray-100'
      },
      'high-contrast': {
        bg: 'bg-black',
        text: 'text-white',
        border: 'border-white',
        header: 'bg-yellow-500',
        userBubble: 'bg-yellow-500 text-black',
        botBubble: 'bg-white border-2 border-black text-black'
      }
    };
    return base[theme];
  };

  const getFontSizeClass = () => {
    return {
      small: 'text-xs',
      medium: 'text-sm',
      large: 'text-base'
    }[fontSize];
  };

  const getBubbleStyleClass = () => {
    return {
      rounded: 'rounded-2xl',
      square: 'rounded-md',
      bubble: 'rounded-3xl'
    }[bubbleStyle];
  };

  const getPopupPosition = () => {
    const chatbotX = position.x;
    const chatbotY = position.y;
    const popupWidth = viewMode === 'mini' ? 280 : viewMode === 'split' ? 600 : 380;
    const popupHeight = viewMode === 'mini' ? 400 : 550;
    
    // Default: popup appears to the left and above the chatbot
    let popupX = chatbotX - popupWidth - 10;
    let popupY = chatbotY - popupHeight + 64;
    
    // Adjust if popup would go off-screen
    if (popupX < 10) {
      popupX = chatbotX + 74; // Show to the right instead
    }
    if (popupY < 10) {
      popupY = 10; // Keep at top
    }
    if (popupX + popupWidth > window.innerWidth - 10) {
      popupX = window.innerWidth - popupWidth - 10;
    }
    if (popupY + popupHeight > window.innerHeight - 10) {
      popupY = window.innerHeight - popupHeight - 10;
    }
    
    return { x: popupX, y: popupY };
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
    if (!isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const popupPos = getPopupPosition();
  const themeClasses = getThemeClasses();
  const fontClass = getFontSizeClass();
  const bubbleClass = getBubbleStyleClass();

  return (
    <div className="chatbot-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`fixed ${themeClasses.bg} ${bubbleClass} shadow-2xl ${isMinimized ? 'h-14' : viewMode === 'mini' ? 'h-[400px]' : 'h-[550px]'} ${viewMode === 'split' ? 'w-[600px]' : viewMode === 'mini' ? 'w-[280px]' : 'w-[380px]'} flex ${viewMode === 'split' ? 'flex-row' : 'flex-col'} overflow-visible border ${themeClasses.border} backdrop-blur-sm z-50`}
            style={{ left: popupPos.x, top: popupPos.y }}
          >
            {/* Chat Header */}
            <div className={`${themeClasses.header} p-4 flex items-center justify-between text-white ${getBubbleStyleClass().includes('rounded-3xl') ? 'rounded-t-3xl' : getBubbleStyleClass().includes('rounded-md') ? 'rounded-t-md' : 'rounded-t-2xl'}`}>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <span className="font-semibold text-lg">CuraBot</span>
                  <div className="text-xs text-emerald-100">AI Medical Assistant</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1 hover:bg-emerald-700 rounded-full transition-colors"
                  title={soundEnabled ? 'Mute notifications' : 'Unmute notifications'}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-emerald-700 rounded-full transition-colors"
                >
                  {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <button
                  onClick={toggleChat}
                  className="p-1 hover:bg-emerald-700 rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="group relative max-w-[85%]">
                        {message.type === 'bot' && (
                          <div className="flex items-start space-x-2">
                            <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                              <span className="text-xs">{botAvatar}</span>
                            </div>
                            <div className="flex flex-col">
                              <div className={`${themeClasses.botBubble} p-4 ${getBubbleStyleClass()} ${bubbleStyle === 'bubble' ? 'rounded-tl-md' : ''} shadow-sm`}>
                                <p className={`${fontClass} leading-relaxed whitespace-pre-line`}>{message.content}</p>
                                {message.confidence && (
                                  <div className="flex items-center mt-2 space-x-2">
                                    <div className="flex items-center space-x-1">
                                      <div className={`w-2 h-2 rounded-full ${
                                        message.confidence > 0.8 ? 'bg-green-500' : 
                                        message.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}></div>
                                      <span className="text-xs text-gray-500">
                                        {message.source === 'ai' ? 'AI' : message.source === 'knowledge_base' ? 'Medical KB' : 'Fallback'}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 ml-2">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {message.type === 'user' && (
                          <div className="flex items-start space-x-2 justify-end">
                            <div className="flex flex-col items-end">
                              <div className={`${themeClasses.userBubble} p-4 ${getBubbleStyleClass()} ${bubbleStyle === 'bubble' ? 'rounded-tr-md' : ''} shadow-md`}>
                                <p className={`${fontClass} leading-relaxed whitespace-pre-line`}>{message.content}</p>
                                {message.imageDataUrl && (
                                  <img src={message.imageDataUrl} alt="attachment" className="mt-2 w-40 max-h-40 object-cover rounded-lg border border-white/30" />
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 mr-2">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                              <span className="text-xs font-medium text-white">{userAvatar}</span>
                            </div>
                          </div>
                        )}
                        {message.type === 'bot' && (
                          <div className="absolute -bottom-4 left-9 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                            <button
                              onClick={() => handleReaction(message.id, 'like')}
                              className={`p-1 rounded-full transition-all duration-200 ${message.liked ? 'bg-emerald-100 text-emerald-600 scale-110' : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'} shadow-md border border-gray-200`}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleReaction(message.id, 'dislike')}
                              className={`p-1 rounded-full transition-all duration-200 ${message.disliked ? 'bg-red-100 text-red-600 scale-110' : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600'} shadow-md border border-gray-200`}
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start space-x-2"
                    >
                      <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <MessageSquare className="h-3 w-3 text-white" />
                      </div>
                      <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-md shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-gray-500">AI is thinking...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* AI Features Bar */}
                <div className="px-4 py-3 border-t bg-gradient-to-r from-gray-50 to-gray-100 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {/* Language Selector */}
                      <div className="relative">
                        <button
                          onClick={() => setShowSettings(!showSettings)}
                          className="flex items-center space-x-2 px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 shadow-sm"
                        >
                          <Globe className="h-3 w-3 text-emerald-600" />
                          <span className="font-medium">{currentLanguage.toUpperCase()}</span>
                          <ChevronDown className="h-3 w-3 text-gray-400" />
                        </button>

                        {showSettings && (
                          <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow-xl p-3 min-w-[140px] z-10 backdrop-blur-sm">
                            <div className="text-xs font-semibold text-gray-700 mb-2">Select Language</div>
                            {aiService.getAvailableLanguages().map((lang) => (
                              <button
                                key={lang.code}
                                onClick={() => {
                                  handleLanguageChange(lang.code);
                                  setShowSettings(false);
                                }}
                                className={`block w-full text-left px-3 py-2 text-xs rounded-md hover:bg-gray-100 transition-colors ${
                                  currentLanguage === lang.code ? 'bg-emerald-100 text-emerald-700 font-medium' : 'text-gray-600'
                                }`}
                              >
                                {lang.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Settings Button */}
                      <div className="relative">
                        <button
                          onClick={() => setShowCustomization(!showCustomization)}
                          className="flex items-center justify-center p-2 text-xs bg-white border border-gray-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 shadow-sm"
                        >
                          <Settings className="h-3 w-3 text-emerald-600" />
                        </button>

                        {showCustomization && (
                          <div className="absolute bottom-full right-0 mb-2 bg-white border rounded-lg shadow-xl p-3 min-w-[200px] max-h-[400px] overflow-y-auto z-10 backdrop-blur-sm">
                            <div className="text-xs font-semibold text-gray-700 mb-3">Customization</div>
                            <div className="space-y-3">
                              
                              {/* Theme Selection */}
                              <div>
                                <div className="text-xs font-semibold text-gray-700 mb-2">Theme</div>
                                <div className="flex gap-1">
                                  {(['light', 'dark', 'high-contrast'] as const).map((t) => (
                                    <button
                                      key={t}
                                      onClick={() => setTheme(t)}
                                      className={`px-2 py-1 text-xs rounded ${theme === t ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                      {t === 'high-contrast' ? 'HC' : t}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Font Size */}
                              <div>
                                <div className="text-xs font-semibold text-gray-700 mb-2">Font Size</div>
                                <div className="flex gap-1">
                                  {(['small', 'medium', 'large'] as const).map((size) => (
                                    <button
                                      key={size}
                                      onClick={() => setFontSize(size)}
                                      className={`px-2 py-1 text-xs rounded ${fontSize === size ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                      {size[0].toUpperCase()}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Bubble Style */}
                              <div>
                                <div className="text-xs font-semibold text-gray-700 mb-2">Bubble Style</div>
                                <div className="flex gap-1">
                                  {(['rounded', 'square', 'bubble'] as const).map((style) => (
                                    <button
                                      key={style}
                                      onClick={() => setBubbleStyle(style)}
                                      className={`px-2 py-1 text-xs rounded ${bubbleStyle === style ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                      {style === 'rounded' ? '●' : style === 'square' ? '■' : '◐'}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* View Mode */}
                              <div>
                                <div className="text-xs font-semibold text-gray-700 mb-2">View Mode</div>
                                <div className="flex gap-1">
                                  {(['normal', 'mini', 'split'] as const).map((mode) => (
                                    <button
                                      key={mode}
                                      onClick={() => setViewMode(mode)}
                                      className={`px-2 py-1 text-xs rounded ${viewMode === mode ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                      {mode[0].toUpperCase()}
                                    </button>
                                  ))}
                                </div>
                              </div>


                              {/* Avatar Selection */}
                              <div>
                                <div className="text-xs font-semibold text-gray-700 mb-2">Avatars</div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs w-8">Bot:</span>
                                    <div className="flex gap-1">
                                      {['🤖', '👨‍⚕️', '🏥', '💊', '🩺'].map((avatar) => (
                                        <button
                                          key={avatar}
                                          onClick={() => setBotAvatar(avatar)}
                                          className={`w-6 h-6 text-xs rounded ${botAvatar === avatar ? 'bg-emerald-100' : 'bg-gray-100 hover:bg-gray-200'}`}
                                        >
                                          {avatar}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs w-8">You:</span>
                                    <div className="flex gap-1">
                                      {['U', '👤', '😊', '🙋', '👨', '👩'].map((avatar) => (
                                        <button
                                          key={avatar}
                                          onClick={() => setUserAvatar(avatar)}
                                          className={`w-6 h-6 text-xs rounded ${userAvatar === avatar ? 'bg-emerald-100' : 'bg-gray-100 hover:bg-gray-200'}`}
                                        >
                                          {avatar}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Voice Input */}
                      <button
                        onClick={handleVoiceInput}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          isListening 
                            ? 'bg-red-100 text-red-600 animate-pulse shadow-md' 
                            : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200'
                        }`}
                        title={isListening ? 'Stop listening' : 'Voice input'}
                      >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </button>

                      {/* Image Attach */}
                      <button
                        onClick={handleSelectImageClick}
                        className="p-2 rounded-lg bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200 border border-gray-200"
                        title="Attach image"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleImageChange}
                      />

                      {/* Stop Speaking */}
                      <button
                        onClick={stopSpeaking}
                        className="p-2 rounded-lg bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-gray-200"
                        title="Stop speaking"
                      >
                        <VolumeX className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>



                {/* Selected Image Preview */}
                {selectedImage && (
                  <div className="px-4 pt-3">
                    <div className="flex items-center space-x-3 p-2 border border-emerald-200 bg-emerald-50 rounded-lg">
                      <img src={selectedImage.dataUrl} alt="Selected" className="w-16 h-16 object-cover rounded-md border" />
                      <div className="flex-1 text-xs text-gray-600 truncate">{selectedImage.file.name}</div>
                      <button onClick={clearSelectedImage} className="p-1 rounded-full text-red-600 hover:bg-red-50" title="Remove image">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Chat Input */}
                <div className="p-4 border-t bg-white rounded-b-2xl">
                  <div className="flex space-x-3">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me anything about your health..."
                      className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all duration-200 text-sm"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={isTyping || !inputMessage.trim()}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md disabled:shadow-none"
                    >
                      <Send className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button - draggable */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        onMouseDown={handleMouseDown}
        className={`bg-gradient-to-r from-emerald-600 to-emerald-700 text-white w-16 h-16 rounded-full shadow-2xl hover:from-emerald-700 hover:to-emerald-800 border-4 border-white flex items-center justify-center fixed z-50 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ 
          left: position.x, 
          top: position.y,
          transition: isDragging ? 'none' : 'all 0.3s ease'
        }}
      >
        <div className="relative">
          <MessageSquare className="h-8 w-8" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </motion.button>
    </div>
  );
}