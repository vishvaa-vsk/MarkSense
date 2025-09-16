import React, { useState, useRef, useEffect } from "react";
import aiService from "../services/aiService";

const FloatingAIBot = ({ noteContent = "", onInsertContent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Markdown syntax helpers
  const syntaxHelpers = [
    {
      label: "Table",
      icon: "📊",
      example: "Create a table with headers: Name, Age, City",
      prompt: "Help me create a table for: ",
    },
    {
      label: "Link",
      icon: "🔗",
      example: "Link to React documentation",
      prompt: "Help me format a link for: ",
    },
    {
      label: "Code Block",
      icon: "💻",
      example: "JavaScript function example",
      prompt: "Help me format code for: ",
    },
    {
      label: "List",
      icon: "📝",
      example: "Todo list or bullet points",
      prompt: "Help me create a list for: ",
    },
    {
      label: "Headers",
      icon: "📋",
      example: "Document structure",
      prompt: "Help me organize with headers for: ",
    },
    {
      label: "Quote",
      icon: "💬",
      example: "Format a quote or citation",
      prompt: "Help me format a quote for: ",
    },
  ];

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim() || isLoading) return;

    const userMessage = { type: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Use specific markdown helper instead of general chat
      const response = await aiService.getMarkdownHelp(message);
      const aiMessage = { type: "ai", content: response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        type: "ai",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleSyntaxHelper = (helper) => {
    const message = helper.prompt + helper.example;
    setInputMessage(message);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInsertResponse = (content) => {
    if (onInsertContent && typeof onInsertContent === "function") {
      onInsertContent(content);
    }
  };

  const toggleBot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Show welcome message on first open
      if (messages.length === 0) {
        setMessages([
          {
            type: "ai",
            content: `Hi! I'm your markdown assistant. I can help you with:

• Creating tables and formatting
• Link syntax and formatting  
• Code blocks and syntax highlighting
• Lists and organization
• Headers and document structure
• Quotes and citations

Just ask me for specific markdown help!`,
          },
        ]);
      }
    }
  };

  return (
    <>
      {/* Floating Bot Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleBot}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all duration-300 ${
            isOpen
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          } hover:scale-110`}
          title={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
        >
          {isOpen ? "✕" : "🤖"}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-40">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">AI Markdown Assistant</h3>
              <button
                onClick={toggleBot}
                className="text-white hover:text-gray-200 text-lg"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Syntax Helpers */}
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-600 mb-2">Quick helpers:</p>
            <div className="grid grid-cols-3 gap-1">
              {syntaxHelpers.map((helper) => (
                <button
                  key={helper.label}
                  onClick={() => handleSyntaxHelper(helper)}
                  className="p-2 text-xs bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 flex flex-col items-center"
                  title={helper.example}
                >
                  <span className="text-sm">{helper.icon}</span>
                  <span className="text-xs">{helper.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.type === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.type === "ai" && (
                    <button
                      onClick={() => handleInsertResponse(message.content)}
                      className="block mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Insert into note
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask for markdown help..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAIBot;
