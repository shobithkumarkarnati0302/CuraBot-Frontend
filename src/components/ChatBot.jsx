import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const initialMessages = [
  {
    id: '1',
    type: 'bot',
    content: "Hello! I'm your CuraBot assistant. How can I help you today?",
    timestamp: new Date()
  }
];

const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');

export function ChatBot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatRef = useRef(null);

  const quickActions = [
    { label: '📅 Book Appointment', action: () => navigate('/appointments') },
    { label: '👨‍⚕️ Find Doctor', action: () => navigate('/doctors') },
    { label: '🏥 Our Services', action: () => navigate('/services') },
    { label: '🔬 Lab Records', action: () => navigate('/lab-records') },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640 && isOpen) {
        chatRef.current.style.width = '100%';
        chatRef.current.style.height = '100%';
      } else {
        chatRef.current.style.width = '350px';
        chatRef.current.style.height = isMinimized ? '56px' : '500px';
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const playNotification = () => {
    if (soundEnabled && !isOpen) {
      notificationSound.play();
    }
  };

  const handleReaction = (messageId, reaction) => {
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

  const handleQuickAction = (action) => {
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: action.label,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    action.action();
    setIsOpen(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage.trim().toLowerCase());
      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      playNotification();
    }, Math.random() * 1000 + 1000);
  };

  const getBotResponse = (input) => {
    // Common symptoms and conditions
    if (input.includes('headache') || input.includes('head pain')) {
      return "If you're experiencing a headache, it could be due to various factors. For persistent or severe headaches, I recommend scheduling an appointment with our neurologist. Would you like me to help you book an appointment?";
    } else if (input.includes('fever') || input.includes('temperature')) {
      return "If you have a fever, it's important to monitor your temperature. For temperatures above 103°F (39.4°C) or fever lasting more than 3 days, please seek immediate medical attention. Would you like to schedule an urgent care appointment?";
    } else if (input.includes('covid') || input.includes('coronavirus')) {
      return "If you're experiencing COVID-19 symptoms or need testing, we offer both rapid and PCR tests. Our dedicated COVID-19 care team is available 24/7. Would you like to schedule a COVID-19 test or consultation?";
    } else if (input.includes('blood pressure') || input.includes('hypertension')) {
      return "Regular blood pressure monitoring is crucial for cardiovascular health. Our cardiology department offers comprehensive blood pressure management services. Would you like to schedule a check-up with our cardiologist?";
    } else if (input.includes('diabetes') || input.includes('blood sugar')) {
      return "We provide comprehensive diabetes care and management services. Our endocrinologists can help you develop a personalized treatment plan. Would you like to schedule a consultation?";
    }

    // Appointment and scheduling
    if (input.includes('appointment') || input.includes('book')) {
      return "You can book an appointment by visiting our Appointments page. Would you like me to guide you there? Just click the quick action button below or type 'yes' to proceed.";
    } else if (input.includes('doctor') || input.includes('specialist')) {
      return "We have various specialists available. You can view all our doctors on the Doctors page. What type of specialist are you looking for? I can help you find the right doctor for your needs.";
    } else if (input.includes('emergency')) {
      return "🚨 For medical emergencies, please call our 24/7 emergency hotline at +1 (555) 911-0000 immediately. Do you need immediate assistance?";
    } else if (input.includes('lab') || input.includes('test')) {
      return "You can view and download your lab test results from our Lab Records section. Would you like me to take you there? I can help you navigate through your records.";
    }

    // Insurance and payment
    if (input.includes('insurance') || input.includes('coverage')) {
      return "We accept most major insurance plans. For specific coverage questions, please provide your insurance provider, and I can check if it's accepted. Would you like to know more about our accepted insurance plans?";
    } else if (input.includes('payment') || input.includes('bill')) {
      return "We offer various payment options and flexible payment plans. Our billing department can assist you with any specific questions. Would you like me to provide more information about payment options?";
    }

    // General inquiries
    if (input.includes('hello') || input.includes('hi')) {
      return "Hello! 👋 How can I assist you with your healthcare needs today? Feel free to ask about appointments, doctors, lab results, or any other services.";
    } else if (input.includes('thank')) {
      return "😊 You're welcome! Is there anything else I can help you with? Don't hesitate to ask if you have more questions.";
    } else if (input.includes('hours') || input.includes('timing')) {
      return "Our regular hours are:\nMonday-Friday: 8:00 AM - 8:00 PM\nSaturday: 9:00 AM - 5:00 PM\nSunday: Emergency Services Only\n\nOur emergency department is available 24/7.";
    } else if (input.includes('location') || input.includes('address')) {
      return "We are located at 123 Healthcare Ave, Medical District, City, State 12345. We're easily accessible by public transport and have ample parking space. Would you like directions?";
    } else if (input.includes('yes')) {
      return "Great! Please click on one of the quick action buttons below to proceed with your request.";
    } else if (input.includes('no')) {
      return "Alright! Let me know if you need anything else. I'm here to help!";
    }

    // Preventive care
    if (input.includes('vaccine') || input.includes('immunization')) {
      return "We offer all recommended vaccinations for adults and children. Our immunization clinic is open during regular hours. Would you like to schedule a vaccination appointment?";
    } else if (input.includes('checkup') || input.includes('physical')) {
      return "Regular check-ups are important for maintaining good health. We recommend annual physical examinations. Would you like to schedule a comprehensive health check-up?";
    }

    // Default response
    return "I'm here to help with appointments, finding doctors, accessing lab records, and other medical services. Could you please provide more details about what you need? You can also use the quick action buttons below.";
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

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 sm:p-0 sm:bottom-4 sm:right-4" ref={chatRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`bg-white rounded-lg shadow-xl mb-4 flex flex-col overflow-hidden
              ${isMinimized ? 'h-14' : 'h-full sm:h-[500px]'}
              w-full sm:w-[350px]
              fixed sm:relative
              bottom-0 left-0 sm:bottom-auto sm:left-auto
              ${isOpen ? 'inset-0 sm:inset-auto' : ''}`}
          >
            <div className="bg-emerald-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span className="font-semibold">CuraBot Assistant</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 hover:bg-emerald-700 rounded-full transition-colors"
                  title={soundEnabled ? 'Mute notifications' : 'Unmute notifications'}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-emerald-700 rounded-full transition-colors hidden sm:block"
                >
                  {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <button
                  onClick={toggleChat}
                  className="p-2 hover:bg-emerald-700 rounded-full transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="group relative max-w-[80%]">
                        <div
                          className={`p-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p className="text-sm break-words">{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {message.type === 'bot' && (
                          <div className="absolute -bottom-4 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                            <button
                              onClick={() => handleReaction(message.id, 'like')}
                              className={`p-1 rounded-full ${message.liked ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'} hover:bg-emerald-200`}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleReaction(message.id, 'dislike')}
                              className={`p-1 rounded-full ${message.disliked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'} hover:bg-red-200`}
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Assistant is typing...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-2 border-t grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action)}
                      className="p-2 text-sm bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-600 rounded-md transition-colors duration-200"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>

                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-emerald-600 text-white p-2 rounded-md hover:bg-emerald-700 transition-colors"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleChat}
        className="fixed bottom-4 right-4 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
      >
        <MessageSquare className="h-6 w-6" />
      </motion.button>
    </div>
  );
}