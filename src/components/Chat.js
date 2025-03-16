import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Send,Hourglass,User,  MessageSquare, Plus, Trash2, ChevronLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authUtils } from './utils/auth';
import { toast } from 'react-hot-toast';
import UserMenu from './UserMenu';
import { useNavigate, Link } from 'react-router-dom';
import MarkdownRenderer from './utils/MarkdownRenderer';


const api = axios.create({
  baseURL: 'https://df51-2405-201-2032-9025-3164-ca0c-e961-1080.ngrok-free.app',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
});

const QuickActionButton = ({ onClick, children }) => (
  <motion.button
    onClick={onClick}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="group w-52 flex items-center justify-center gap-3 px-4 py-2.5 bg-gradient-to-r from-amber-900 to-amber-800 text-white text-sm
rounded-full transition-all duration-200 border border-amber-500/20 hover:border-amber-400/40 mt-3"

  >
    <span className="md:text-sm text-xs font-medium text-white">{children}</span>
  </motion.button>
);





const TypingIndicator = () => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="flex items-center space-x-2 p-4 bg-amber-900/20 text-amber-100 rounded-lg max-w-[200px] border border-amber-500/20"
    >
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -6, 0],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
          className="w-2.5 h-2.5 bg-amber-500 rounded-full"
        />
      ))}
    </div>
    <span className="text-sm text-amber-600">AI is typing...</span>
  </motion.div>
);

  

const Chat = () => {
  const navigate = useNavigate();
  const currentUser = authUtils.getCurrentUser();
  const inputRef = useRef(null);
  const initialChatId = uuidv4(); // Generate initial chat ID

    const [isOpen, setIsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [messages, setMessages] = useState({ [initialChatId]: [] }); // Initialize with empty array for first chat
  const [chats, setChats] = useState([{ id: initialChatId, name: 'New Chat' }]);
  const [activeChat, setActiveChat] = useState(initialChatId);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [waitingForEmail, setWaitingForEmail] = useState(false);
  const [waitingForFeedback, setWaitingForFeedback] = useState(false);
  
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Ensure messages object is properly initialized for the active chat
    if (!messages[activeChat]) {
      setMessages(prev => ({
        ...prev,
        [activeChat]: []
      }));
    }
  }, [activeChat]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages[activeChat]]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [inputMessage]);

  const createNewChat = () => {
    const newChatId = uuidv4();
    setChats(prev => [{ id: newChatId, name: 'New Chat' }, ...prev]);
    setActiveChat(newChatId);
    setMessages(prev => ({ ...prev, [newChatId]: [] }));
  };

  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    setMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[chatId];
      return newMessages;
    });
    
    if (activeChat === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      if (remainingChats.length > 0) {
        setActiveChat(remainingChats[0].id);
      } else {
        createNewChat();
      }
    }
  };

  const updateChatName = (chatId, firstMessage) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, name: firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '') }
        : chat
    ));
  };

  const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const startTypingIndicator = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

// Static response logic
const getStaticResponse = (message) => {
  if (message === "How are you better than ChatGPT?") {
    return {
      content: `Our data is stored on Indian server using 256 bit encryption and i am a better expert on indian financial instruments and data.`,
      metadata: {},
      source: "static"
    };
  } else if (message === "Join the Waitlist") {
    return {
      content: "Please provide your email id in the chat.",
      metadata: {},
      source: "static",
    };
  } else if (message === "Share Feedback") {
    return {
      content: "Please share your feedback! We'd love to hear your thoughts on how we can improve.",
      metadata: {},
      source: "static",
    };
  }
  return null;
};

const toggleTypingIndicator = useCallback((isTyping) => {
  setIsTyping(isTyping);
  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }
}, []);


const sendMessage = useCallback(async (message) => {
  const staticResponse = getStaticResponse(message);
  if (staticResponse) {
    return staticResponse;
  }

  try {
    // Start the typing indicator
    toggleTypingIndicator(true);

    // Send the API request
    const response = await api.post('/query', {
      user_id: 'darshit',
      query: message,
      conversation_id: activeChat,
      metadata: {
        additional_info: 'string',
      },
    });

    // Stop the typing indicator after response
    toggleTypingIndicator(false);

    return {
      content: response.data.response || response.data.metadata?.explanation || 'No response available',
      metadata: response.data.metadata,
      source: response.data.source,
    };
  } catch (error) {
    // Stop the typing indicator in case of error
    toggleTypingIndicator(false);

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please try again.');
      }
      if (error.response) {
        throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
      }
      if (error.request) {
        throw new Error('Unable to reach the server. Please check your internet connection.');
      }
    }
    throw new Error('An unexpected error occurred. Please try again later.');
  }
},[toggleTypingIndicator, activeChat]);


  const handleEmailSubmission = useCallback(async (email) => {
    try {
      toggleTypingIndicator(true);
      const response = await axios({
        method: 'post',
        url: 'https://script.google.com/macros/s/AKfycbyt5kDLqDdHzJWmenxEHYi60IbE-4Pf9g9HwHnxSmb_Y99WQkYAGSR7RMOEhSvdtIU0/exec',
        headers: {
          'Content-Type': 'text/plain',
        },
        data: {
          email: email,
        },
      });
      toggleTypingIndicator(false);
      // Check if the response has a success status
      if (response.data && response.data.status === "success") {
        setMessages((prev) => ({
          ...prev,
          [activeChat]: [
            ...(prev[activeChat] || []),
            {
              content:
                "Thank you for joining our waitlist! We'll keep you updated on our latest developments.",
              isUser: false,
              timestamp: formatTimestamp(),
            },
          ],
        }));
        setWaitingForEmail(false);
      } else {
        throw new Error(response.data?.message || "Failed to join the waitlist");
      }
    } catch (error) {
      toggleTypingIndicator(false);
      console.error("Email submission error:", error);
      setMessages((prev) => ({
        ...prev,
        [activeChat]: [
          ...(prev[activeChat] || []),
          {
            content: "Sorry, there was an error processing your request. Please try again later.",
            isUser: false,
            isError: true,
            timestamp: formatTimestamp(),
          },
        ],
      }));
      setWaitingForEmail(false);
    }
  },[toggleTypingIndicator, activeChat]);
  
  const handleFeedbackSubmission = useCallback(async (feedback) => {
    try {
      toggleTypingIndicator(true);
      const response = await axios({
        method: 'post',
        url: 'https://script.google.com/macros/s/AKfycbyijUN58P-pvvVWw_Dcc44AF_KOeQXTLbAH0CiJYzoQYERNMO-ShorUDChRXF6JPbGd/exec',
        headers: {
          'Content-Type': 'text/plain',
        },
        data: {
          text: feedback, // sending text instead of feedback
        },
      });
      toggleTypingIndicator(false);
      if (response.data && response.data.status === "success") {
        setMessages((prev) => ({
          ...prev,
          [activeChat]: [
            ...(prev[activeChat] || []),
            {
              content: "Thank you for your feedback! We really appreciate your help in making PaisaBay better.",
              isUser: false,
              timestamp: formatTimestamp(),
            },
          ],
        }));
        setWaitingForFeedback(false);
      } else {
        throw new Error(response.data?.message || "Failed to submit feedback");
      }
    } catch (error) {
      toggleTypingIndicator(false);
      console.error("Feedback submission error:", error);
      setMessages((prev) => ({
        ...prev,
        [activeChat]: [
          ...(prev[activeChat] || []),
          {
            content: "Sorry, there was an error submitting your feedback. Please try again later.",
            isUser: false,
            isError: true,
            timestamp: formatTimestamp(),
          },
        ],
      }));
      setWaitingForFeedback(false);
    }
  },[toggleTypingIndicator, activeChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);

    const timestamp = formatTimestamp();
    const currentMessages = messages[activeChat] || [];
    
    if (currentMessages.length === 0) {
      updateChatName(activeChat, userMessage);
    }

    setMessages(prev => ({
      ...prev,
      [activeChat]: [...currentMessages, { 
        content: userMessage, 
        isUser: true, 
        timestamp 
      }]
    }));

    if (waitingForEmail) {
      await handleEmailSubmission(userMessage);
      return;
    }
  
    if (waitingForFeedback) {
      await handleFeedbackSubmission(userMessage);
      return;
    }
    setIsLoading(true);

    try {
      const response = await sendMessage(userMessage);
      setIsTyping(false);
      
      setMessages(prev => ({
        ...prev,
        [activeChat]: [...(prev[activeChat] || []), { 
          content: response.content,
          isUser: false,
          metadata: response.metadata,
          source: response.source,
          timestamp: formatTimestamp()
        }]
      }));
    } catch (error) {
      setError(error.message);
      setMessages(prev => ({
        ...prev,
        [activeChat]: [...(prev[activeChat] || []), { 
          content: error.message,
          isUser: false,
          isError: true,
          timestamp: formatTimestamp()
        }]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickActionClick = (message) => {
    setMessages(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), {
        content: message,
        isUser: true,
        timestamp: formatTimestamp()
      }, {
        content: getStaticResponse(message).content,
        isUser: false,
        timestamp: formatTimestamp()
      }]
    }));
  
    if (message === "Join the Waitlist") {
      setWaitingForEmail(true);
    } else if (message === "Share Feedback") {
      setWaitingForFeedback(true);
    }
  };

  const WelcomeMessage = useCallback(() => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full text-center px-4 gap-6"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotateY: [0, 360]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center"
      >
        <Hourglass className="w-8 h-8 text-black" />
      </motion.div>

      <div className="space-y-3 max-w-xl">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
          Welcome to PaisaBay AI Assistant
        </h2>
        <p className="text-amber-200/70">
          I'm here to help you understand and manage your finances better. Ask me anything about:
        </p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {[
            "Policy Analysis", 
            "Investment Guidance",
            "Financial Planning",
            "Insurance Coverage",
          ].map((item) => (
            <div key={item} className="p-3 bg-gradient-to-br from-black/90 via-amber-900/20 to-black/90 rounded-lg border border-amber-500/20 text-amber-200/80">
              {item}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  ), []);
  
  const StaticPills = () => {
    // const container = {
    //   hidden: { opacity: 0 },
    //   show: {
    //     opacity: 1,
    //     transition: {
    //       staggerChildren: 0.1
    //     }
    //   }
    // };
  
    // const item = {
    //   hidden: { opacity: 0, y: 20, scale: 0.8 },
    //   show: { opacity: 1, y: 0, scale: 1 }
    // };
  
    return (
      <motion.div
        // variants={container}
        initial="hidden"
        animate="show"
        className="fixed hidden md:grid top-80 right-8  grid-cols-1 gap-3 z-50"
      >
        {[
          "New GST rules",
"Analyze your salary",
"Save more on taxes",
"How to get Free pizza using credit card",
"Analyze 2024 spendings",
"What is my networth?",
"Credit Cards points usage",
"Skip Traffic check points",
"How to Invest in Crypto"
        ].map((text) => (
          <motion.div
            key={text}
            // variants={item}
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(251, 191, 36, 0.1)",
              transition: { type: "spring", stiffness: 400, damping: 10 }
            }}
            whileTap={{ scale: 0.95 }}
            className="group relative p-2 bg-gradient-to-br from-black/90 via-amber-900/20 to-black/90 
            rounded-full border border-amber-500/20 text-amber-200/80 text-xs whitespace-nowrap
            backdrop-blur-sm shadow-lg text-center 
            hover:border-amber-500/40 hover:text-amber-200 transition-colors duration-300
            overflow-hidden"
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-amber-500/5 rounded-full blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
  
            {/* Shimmering effect */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100"
              style={{
                background: "linear-gradient(45deg, transparent, rgba(251, 191, 36, 0.1), transparent)",
                backgroundSize: "200% 200%",
              }}
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
  
            {/* Text with icon placeholder for potential future use */}
            <div className="relative flex items-center justify-center ">
              <span className="text-xs">{text}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };
  

  return (
    <div className="flex h-screen ">
    {/* Sidebar */}
    <div 
  className={`fixed h-full bg-gradient-to-b from-amber-900 to-black w-64 z-30
  transition-all duration-300 ease-in-out transform
  ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
>
  <div className="p-4">
    <button
      onClick={createNewChat}
      className="w-full flex items-center gap-2 px-4 py-3 text-black bg-gradient-to-r from-amber-500 to-yellow-500 
      hover:from-amber-400 hover:to-yellow-400 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
    >
      <Plus className="h-5 w-5" />
      Create New Chat
    </button>
  </div>
      <div className="overflow-y-auto h-[calc(100%-5rem)]">
        {chats.map(chat => (
          <motion.div
            key={chat.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            onClick={() => setActiveChat(chat.id)}
            className={`group flex items-center justify-between px-4 py-3 cursor-pointer text-amber-100/80 
              hover:bg-amber-800/20 transition-all duration-200 
              ${activeChat === chat.id ? 'bg-amber-800/30 border-r-4 border-amber-500' : ''}`}
          >
            <div className="flex items-center gap-2 truncate">
              <MessageSquare className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{chat.name}</span>
            </div>
            <button
              onClick={(e) => deleteChat(chat.id, e)}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-400 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Overlay */}
    {isSidebarOpen && (
      <div 
        className="fixed inset-0 bg-black/30 z-20"
        onClick={() => setIsSidebarOpen(false)}
      />  
    )}

    {/* Main centered container */}
    <div className="flex-1 flex justify-center h-screen bg-[#000000f7] ">
      {/* Main chat container */}
      <div className="flex flex-col w-full max-w-4xl">
      <header className="relative bg-black/80 backdrop-blur-sm border-b border-amber-500/20">
  <div className="relative top-0 left-0 right-0 bg-gradient-to-r from-amber-900 to-amber-800 text-white text-[0.6rem] md:text-sm py-1">
 <p className="text-center px-4">
      🚀 We're in Beta! Experience our app early and help us shape the future. Your feedback means the world!
    </p>
  </div>
  
  <div className="flex items-center justify-center px-6 py-4 mt-1 md:mt-3">
    {/* Left Arrow Button (For Mobile and Desktop) */}
    <button 
  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
  className="absolute left-4 top-[4.5rem]  md:top-16 -translate-y-1/2 p-2.5 text-amber-200 hover:text-amber-100 bg-amber-900/50 hover:bg-amber-800/50 rounded-lg transition-all duration-200 hover:scale-105"
>
      {isSidebarOpen ? (
        <ChevronLeft className="h-5 w-5" />
      ) : (
        <ChevronRight className="h-5 w-5" />
      )}
    </button>

    {/* Logo with Beta Tag (Centered for Desktop and Stacked on Mobile) */}
    <div className="flex flex-col items-center">
      <Link to='/' className="flex items-center relative cursor-pointer" >
        <Hourglass className="h-8 w-8 text-amber-400" />
        <span className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
          Paisabay
        </span>
        <div className="absolute -top-3 -right-14">
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold bg-gradient-to-r from-amber-200 to-yellow-400   backdrop-blur-md text-amber-900 rounded-full shadow-sm border border-amber-200/50">
            BETA
          </span>
        </div>
      </Link>
    </div>


      </div>
    </header>

{/* Add this right after the header - User Menu */}
<div className="fixed top-4 right-4 z-50">
  {/* Mobile User Menu */}
  <div className="block md:hidden">
    {authUtils.isAuthenticated() ? (
      <>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center space-x-2 px-2 py-1 bg-gradient-to-r from-cyan-600 to-cyan-700 
        rounded-lg text-white hover:shadow-lg transition-all duration-200"
        >
          <div className="w-6 h-6 rounded-lg bg-cyan-400 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>  
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
        </motion.button>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" 
                onClick={() => setIsMobileMenuOpen(false)} 
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.2 }}
                className="absolute top-12 right-0 w-72 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50"
              >
                <UserMenu isMobile={true} onClose={() => setIsMobileMenuOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    ) : (
      <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate('/login')}
      className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-700 
      rounded-lg text-white hover:shadow-lg transition-all duration-200"
    >
        Login
      </motion.button>
    )}
  </div>

  {/* Desktop User Menu */}
  <div className="hidden md:block">
    {authUtils.isAuthenticated() ? (
      <UserMenu />
    ) : (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/login')}
        className="px-6 py-2 z-9999 bg-gradient-to-r from-amber-600 to-amber-700 
        rounded-lg text-white hover:shadow-lg transition-all duration-200"
      >
        Login
      </motion.button>
    )}
  </div>
</div>
<StaticPills />


<div className="flex-1 overflow-y-auto px-5 py-4 bg-[#dfdedd08]">
{(!messages[activeChat] || messages[activeChat].length === 0) ? (
    <WelcomeMessage />
  ) : (
    <AnimatePresence mode="popLayout">
            {messages[activeChat]?.map((message, index) => (
              <motion.div
                key={`${message.timestamp}-${index}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                className={`flex w-full ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
             <div className={`max-w-[80%] rounded-xl p-4 mb-4 ${message.isUser 
  ? 'bg-[#0f0f0f] text-amber-100 border-l-4 border-amber-500/30 hover:border-amber-400/40' 
  : 'bg-gradient-to-br from-gray-900 to-black text-amber-100 border border-amber-500/20'}`}>
                 {message.isUser ? (
                    <p className="text-sm text-justify whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <MarkdownRenderer content={message.content} />
                  )}
                  <p className="text-xs mt-2 opacity-70">{message.timestamp}</p>
                </div>
              </motion.div>
            ))}
            {isTyping && <TypingIndicator />}
            </AnimatePresence>
  )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-amber-500/20 bg-black/80 backdrop-blur-sm px-4 py-4">
        <form
            onSubmit={handleSubmit}
            className="relative flex items-center"
          >
            <textarea
              value={inputMessage}
              ref={inputRef}
              autoFocus
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={waitingForFeedback ? "Type your feedback here..." : "Type your message..."}
              rows={1}
              className="w-full p-4 pr-12 rounded-lg border border-amber-500/20 bg-black/50 text-amber-100 focus:outline-none 
              focus:ring-2 focus:ring-amber-500 transition-all duration-200 shadow-sm hover:shadow-md 
              resize-none overflow-y-clip min-h-[56px] max-h-[200px] placeholder-amber-200/50"
            
              disabled={isLoading}
              style={{
                minHeight: '56px',
                maxHeight: '200px'
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="absolute right-4 p-2 rounded-lg text-amber-500 hover:bg-amber-50
              disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{
                bottom: '8px'
              }}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          
          <AnimatePresence>
          <div className="flex flex-col md:flex-row items-center md:justify-start md:gap-5 gap-0 w-full mt-1 md:mt-5">
  <QuickActionButton 
    onClick={() => handleQuickActionClick("How are you better than ChatGPT?")}
  >
    Compare with ChatGPT
  </QuickActionButton>

  <QuickActionButton 
    onClick={() => handleQuickActionClick("Join the Waitlist")}
  >
    Join the Waitlist
  </QuickActionButton>

  <QuickActionButton 
    onClick={() => {
      handleQuickActionClick("Share Feedback");
      setWaitingForFeedback(true);
    }}
  >
    Share Feedback
  </QuickActionButton>
</div>
          </AnimatePresence>
        </div>

        <footer className="text-center p-3 text-sm text-amber-200/60 bg-black/80 backdrop-blur-sm border-t border-amber-500/20">
          <p>© 2024 Paisabay. All rights reserved.</p>
        </footer>
      </div>
    </div>
  </div>
);
};

export default Chat;
