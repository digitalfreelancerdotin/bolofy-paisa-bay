import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Send, Hourglass, MessageSquare, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MarkdownRenderer from "./utils/MarkdownRenderer";

const api = axios.create({
  baseURL: "https://df51-2405-201-2032-9025-3164-ca0c-e961-1080.ngrok-free.app",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

// QuickActionButton removed (unused)

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="flex items-center space-x-2 p-4 rounded-lg max-w-[200px] border"
    style={{
      backgroundColor: 'var(--color-ai-message-bg)',
      color: 'var(--color-ai-message-text)',
      borderColor: 'var(--color-ai-message-border)'
    }}
  >
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -6, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: 'var(--color-ai-message-text)' }}
        />
      ))}
    </div>
    <span className="text-sm" style={{ color: 'var(--color-ai-message-text)' }}>AI is typing...</span>
  </motion.div>
);

const Chat = () => {
  // currentUser removed (unused)
  const inputRef = useRef(null);
  const initialChatId = uuidv4(); // Generate initial chat ID

  const [messages, setMessages] = useState({ [initialChatId]: [] });
  const [chats, setChats] = useState([{ id: initialChatId, name: "New Chat" }]);
  const [activeChat, setActiveChat] = useState(initialChatId);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Removed error state (messages show errors inline)
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [waitingForEmail, setWaitingForEmail] = useState(false);
  const [waitingForFeedback, setWaitingForFeedback] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Ensure messages object is properly initialized for the active chat
    setMessages((prev) => {
      if (prev[activeChat]) return prev;
      return { ...prev, [activeChat]: [] };
    });
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  // Handle screen resize to close sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [sidebarOpen]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    const textarea = document.querySelector("textarea");
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [inputMessage]);

  const createNewChat = () => {
    const newChatId = uuidv4();
    setChats((prev) => [{ id: newChatId, name: "New Chat" }, ...prev]);
    setActiveChat(newChatId);
    setMessages((prev) => ({ ...prev, [newChatId]: [] }));
  };

  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    setMessages((prev) => {
      const newMessages = { ...prev };
      delete newMessages[chatId];
      return newMessages;
    });

    if (activeChat === chatId) {
      const remainingChats = chats.filter((chat) => chat.id !== chatId);
      if (remainingChats.length > 0) {
        setActiveChat(remainingChats[0].id);
      } else {
        createNewChat();
      }
    }
  };

  const updateChatName = (chatId, firstMessage) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              name:
                firstMessage.slice(0, 30) +
                (firstMessage.length > 30 ? "..." : ""),
            }
          : chat
      )
    );
  };

  const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // startTypingIndicator removed (unused)

  // Static response logic
  const getStaticResponse = (message) => {
    if (message === "How are you better than ChatGPT?") {
      return {
        content: `Our data is stored on Indian server using 256 bit encryption and i am a better expert on indian financial instruments and data.`,
        metadata: {},
        source: "static",
      };
    } else if (message === "Join the Waitlist") {
      return {
        content: "Please provide your email id in the chat.",
        metadata: {},
        source: "static",
      };
    } else if (message === "Share Feedback") {
      return {
        content:
          "Please share your feedback! We'd love to hear your thoughts on how we can improve.",
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

  const sendMessage = useCallback(
    async (message) => {
      const staticResponse = getStaticResponse(message);
      if (staticResponse) {
        return staticResponse;
      }

      try {
        // Start the typing indicator
        toggleTypingIndicator(true);

        // Send the API request
        const response = await api.post("/query", {
          user_id: "darshit",
          query: message,
          conversation_id: activeChat,
          metadata: {
            additional_info: "string",
          },
        });

        // Stop the typing indicator after response
        toggleTypingIndicator(false);

        return {
          content:
            response.data.response ||
            response.data.metadata?.explanation ||
            "No response available",
          metadata: response.data.metadata,
          source: response.data.source,
        };
      } catch (error) {
        // Stop the typing indicator in case of error
        toggleTypingIndicator(false);

        if (axios.isAxiosError(error)) {
          if (error.code === "ECONNABORTED") {
            throw new Error("Request timed out. Please try again.");
          }
          if (error.response) {
            throw new Error(
              `Server error: ${error.response.status} - ${
                error.response.data?.message || error.response.statusText
              }`
            );
          }
          if (error.request) {
            throw new Error(
              "Unable to reach the server. Please check your internet connection."
            );
          }
        }
        throw new Error(
          "An unexpected error occurred. Please try again later."
        );
      }
    },
    [toggleTypingIndicator, activeChat]
  );

  const handleEmailSubmission = useCallback(
    async (email) => {
      try {
        toggleTypingIndicator(true);
        const response = await axios({
          method: "post",
          url: "https://script.google.com/macros/s/AKfycbyt5kDLqDdHzJWmenxEHYi60IbE-4Pf9g9HwHnxSmb_Y99WQkYAGSR7RMOEhSvdtIU0/exec",
          headers: {
            "Content-Type": "text/plain",
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
          throw new Error(
            response.data?.message || "Failed to join the waitlist"
          );
        }
      } catch (error) {
        toggleTypingIndicator(false);
        console.error("Email submission error:", error);
        setMessages((prev) => ({
          ...prev,
          [activeChat]: [
            ...(prev[activeChat] || []),
            {
              content:
                "Sorry, there was an error processing your request. Please try again later.",
              isUser: false,
              isError: true,
              timestamp: formatTimestamp(),
            },
          ],
        }));
        setWaitingForEmail(false);
      }
    },
    [toggleTypingIndicator, activeChat]
  );

  const handleFeedbackSubmission = useCallback(
    async (feedback) => {
      try {
        toggleTypingIndicator(true);
        const response = await axios({
          method: "post",
          url: "https://script.google.com/macros/s/AKfycbyijUN58P-pvvVWw_Dcc44AF_KOeQXTLbAH0CiJYzoQYERNMO-ShorUDChRXF6JPbGd/exec",
          headers: {
            "Content-Type": "text/plain",
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
                content:
                  "Thank you for your feedback! We really appreciate your help in making OpenEvents better.",
                isUser: false,
                timestamp: formatTimestamp(),
              },
            ],
          }));
          setWaitingForFeedback(false);
        } else {
          throw new Error(
            response.data?.message || "Failed to submit feedback"
          );
        }
      } catch (error) {
        toggleTypingIndicator(false);
        console.error("Feedback submission error:", error);
        setMessages((prev) => ({
          ...prev,
          [activeChat]: [
            ...(prev[activeChat] || []),
            {
              content:
                "Sorry, there was an error submitting your feedback. Please try again later.",
              isUser: false,
              isError: true,
              timestamp: formatTimestamp(),
            },
          ],
        }));
        setWaitingForFeedback(false);
      }
    },
    [toggleTypingIndicator, activeChat]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    // clear previous inline errors handled via message list

    const timestamp = formatTimestamp();
    const currentMessages = messages[activeChat] || [];

    if (currentMessages.length === 0) {
      updateChatName(activeChat, userMessage);
    }

    setMessages((prev) => ({
      ...prev,
      [activeChat]: [
        ...currentMessages,
        {
          content: userMessage,
          isUser: true,
          timestamp,
        },
      ],
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

      setMessages((prev) => ({
        ...prev,
        [activeChat]: [
          ...(prev[activeChat] || []),
          {
            content: response.content,
            isUser: false,
            metadata: response.metadata,
            source: response.source,
            timestamp: formatTimestamp(),
          },
        ],
      }));
    } catch (error) {
      setMessages((prev) => ({
        ...prev,
        [activeChat]: [
          ...(prev[activeChat] || []),
          {
            content: error.message,
            isUser: false,
            isError: true,
            timestamp: formatTimestamp(),
          },
        ],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickActionClick = (message) => {
    setMessages((prev) => ({
      ...prev,
      [activeChat]: [
        ...(prev[activeChat] || []),
        {
          content: message,
          isUser: true,
          timestamp: formatTimestamp(),
        },
        {
          content: getStaticResponse(message).content,
          isUser: false,
          timestamp: formatTimestamp(),
        },
      ],
    }));

    if (message === "Join the Waitlist") {
      setWaitingForEmail(true);
    } else if (message === "Share Feedback") {
      setWaitingForFeedback(true);
    }
  };

  const WelcomeMessage = useCallback(
    () => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-full text-center px-4 gap-6"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotateY: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-button-primary-bg)' }}
        >
          <Hourglass className="w-8 h-8" style={{ color: 'var(--color-button-primary-text)' }} />
        </motion.div>

        <div className="space-y-3 max-w-xl">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Welcome to OpenEvents AI Assistant
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            I'm here to help you discover and manage events. Ask me anything
            about:
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              "Policy Analysis",
              "Investment Guidance",
              "Financial Planning",
              "Insurance Coverage",
            ].map((item) => (
              <div
                key={item}
                className="p-3 rounded-lg border transition-colors duration-200"
                style={{
                  backgroundColor: 'var(--color-quick-action-bg)',
                  borderColor: 'var(--color-quick-action-border)',
                  color: 'var(--color-quick-action-text)'
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    ),
    []
  );

  // StaticPills removed (unused)

  return (
    <div className="flex flex-col h-screen transition-colors duration-200"
      style={{ backgroundColor: 'var(--color-bg-main)' }}>
      {/* Navbar */}
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar - Chat History (Hidden on mobile by default, toggleable with hamburger) */}
        <div
          className={`
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:relative
          fixed lg:static top-0 left-0 z-50
          w-64 h-full
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:flex
        `}
          style={{
            backgroundColor: 'var(--color-sidebar-bg)',
            borderRight: '1px solid var(--color-border)'
          }}
        >
          {/* Sidebar content */}
          <div className="relative z-50 flex flex-col h-full" style={{ backgroundColor: 'var(--color-sidebar-bg)' }}>
            <div className="p-4">
              <button
                onClick={createNewChat}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{
                  backgroundColor: 'var(--color-button-primary-bg)',
                  color: 'var(--color-button-primary-text)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-primary-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-primary-bg)'}
              >
                <Plus className="h-5 w-5" />
                Create New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar">
              {chats.map((chat) => (
                <motion.div
                  key={chat.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 1, opacity: 1 }}
                  onClick={() => {
                    setActiveChat(chat.id);
                    // Close sidebar on mobile when selecting a chat
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`group flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-200
                    ${
                      activeChat === chat.id
                        ? "border-r-4"
                        : ""
                    }`}
                  style={{
                    color: 'var(--color-sidebar-text)',
                    backgroundColor: activeChat === chat.id ? 'var(--color-sidebar-active)' : 'transparent',
                    borderRightColor: activeChat === chat.id ? 'var(--color-primary)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (activeChat !== chat.id) {
                      e.currentTarget.style.backgroundColor = 'var(--color-sidebar-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeChat !== chat.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate text-sm">{chat.name}</span>
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
        </div>

        {/* Middle Column - Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 relative" style={{ backgroundColor: 'var(--color-bg-main)' }}>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6 md:px-6">
            {!messages[activeChat] || messages[activeChat].length === 0 ? (
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
                      damping: 20,
                    }}
                    className={`flex w-full ${
                      message.isUser ? "justify-end" : "justify-start"
                    } mb-4`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[70%] xl:max-w-[60%]
                  rounded-2xl p-3 shadow-md break-words overflow-wrap-anywhere
                  ${message.isUser ? "" : "border"}`}
                      style={{
                        backgroundColor: message.isUser ? 'var(--color-user-message-bg)' : 'var(--color-ai-message-bg)',
                        color: message.isUser ? 'var(--color-user-message-text)' : 'var(--color-ai-message-text)',
                        borderColor: message.isUser ? 'transparent' : 'var(--color-ai-message-border)'
                      }}
                    >
                      {message.isUser ? (
                        <div>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed break-words overflow-wrap-anywhere hyphens-auto">
                            {message.content}
                          </p>
                          <p className="text-xs text-right mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                            {message.timestamp}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="prose prose-invert prose-sm max-w-none break-words overflow-wrap-anywhere">
                            <MarkdownRenderer content={message.content} />
                          </div>
                          <p className="text-xs text-right mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                            {message.timestamp}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isTyping && <TypingIndicator />}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-4 py-4 flex-shrink-0 transition-colors duration-200"
            style={{
              backgroundColor: 'var(--color-bg-main)',
              borderTop: '1px solid var(--color-border)'
            }}>
            <form
              onSubmit={handleSubmit}
              className="relative flex items-end max-w-full"
            >
              <div className="relative flex-1 min-w-0">
                <textarea
                  value={inputMessage}
                  ref={inputRef}
                  autoFocus
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    waitingForFeedback
                      ? "Type your feedback here..."
                      : "Type your message..."
                  }
                  rows={1}
                  className="w-full p-4 pr-12 rounded-lg border focus:outline-none
                  focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md
                  resize-none overflow-y-auto min-h-[56px] max-h-[200px]
                  break-words overflow-wrap-anywhere hyphens-auto"
                  disabled={isLoading}
                  style={{
                    minHeight: "56px",
                    maxHeight: "200px",
                    wordWrap: "break-word",
                    overflowWrap: "anywhere",
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.5",
                    backgroundColor: 'var(--color-input-bg)',
                    color: 'var(--color-input-text)',
                    borderColor: 'var(--color-input-border)',
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="absolute right-3 bottom-3 p-2 rounded-lg
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  style={{
                    color: 'var(--color-text-primary)',
                  }}
                  onMouseEnter={(e) => !isLoading && inputMessage.trim() && (e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)')}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Sidebar - Quick Actions (Hidden on mobile and tablets, visible on large screens) */}
        <div className="hidden xl:flex xl:w-80 flex-col p-6 flex-shrink-0 transition-colors duration-200"
          style={{
            backgroundColor: 'var(--color-bg-main)',
            borderLeft: '1px solid var(--color-border)'
          }}>
          <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--color-text-primary)' }}>
            Quick Actions
          </h3>
          <div className="space-y-3">
            {[
              "New GST rules",
              "Analyze your salary",
              "Save more on taxes",
              "How to get Free pizza using credit card",
              "Analyze 2024 spendings",
              "What is my networth?",
              "Credit Cards points usage",
              "Skip Traffic check points",
              "How to Invest in Crypto",
            ].map((text) => (
              <motion.button
                key={text}
                onClick={() => handleQuickActionClick(text)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-3 rounded-full border text-sm text-center
                  transition-all duration-200 break-words hyphens-auto"
                style={{
                  backgroundColor: 'var(--color-quick-action-bg)',
                  color: 'var(--color-quick-action-text)',
                  borderColor: 'var(--color-quick-action-border)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-quick-action-hover)';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-quick-action-bg)';
                  e.currentTarget.style.color = 'var(--color-quick-action-text)';
                }}
              >
                {text}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Chat;
