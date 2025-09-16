import React, { useState, useRef, useEffect } from "react";
import aiService from "../services/aiService";

const AIChatOverlay = ({
  isVisible,
  onClose,
  noteContent = "",
  onInsertContent,
}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quickActions] = useState([
    { label: "Summarize", action: "summarize" },
    { label: "Improve Writing", action: "rephrase" },
    { label: "Generate Tags", action: "tags" },
    { label: "Analyze Content", action: "analyze" },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

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
      const response = await aiService.chatAssistant(message, noteContent);
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

  const handleQuickAction = async (action) => {
    if (!noteContent.trim()) {
      const errorMessage = {
        type: "ai",
        content: "Please write some content first so I can help you.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    setIsLoading(true);
    let response = "";
    let userMessage = "";

    try {
      switch (action) {
        case "summarize":
          userMessage = "Summarize my note";
          response = await aiService.summarizeContent(noteContent);
          break;
        case "rephrase":
          userMessage = "Improve my writing";
          response = await aiService.rephraseContent(noteContent);
          break;
        case "tags":
          userMessage = "Generate tags for my note";
          const tags = await aiService.generateTags(noteContent);
          response =
            tags.length > 0
              ? `Here are suggested tags: ${tags.join(", ")}`
              : "No tags could be generated for this content.";
          break;
        case "analyze":
          userMessage = "Analyze my content";
          response = await aiService.analyzeContent(noteContent);
          break;
        default:
          response = "Unknown action";
      }

      const userMsg = { type: "user", content: userMessage };
      const aiMsg = { type: "ai", content: response };
      setMessages((prev) => [...prev, userMsg, aiMsg]);
    } catch (error) {
      const errorMessage = {
        type: "ai",
        content: "Sorry, I encountered an error while processing your request.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleInsertResponse = (content) => {
    if (onInsertContent && typeof onInsertContent === "function") {
      onInsertContent(content);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">AI Assistant</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearChat}
              className="text-gray-500 hover:text-gray-700 text-sm"
              title="Clear chat"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-2 border-b border-gray-100">
          <div className="flex flex-wrap gap-1">
            {quickActions.map((action) => (
              <button
                key={action.action}
                onClick={() => handleQuickAction(action.action)}
                disabled={isLoading}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 text-sm">
              Hi! I'm your AI assistant. I can help you with:
              <ul className="mt-2 text-left list-disc list-inside space-y-1">
                <li>Writing and improving content</li>
                <li>Markdown syntax help</li>
                <li>Summarizing and analyzing text</li>
                <li>Generating tags and organizing notes</li>
              </ul>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                  message.type === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {message.content}
                {message.type === "ai" && (
                  <button
                    onClick={() => handleInsertResponse(message.content)}
                    className="block mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
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
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask me anything about your note..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatOverlay;
