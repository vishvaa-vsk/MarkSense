import React, { useState, useEffect, useCallback } from "react";
import aiService from "../services/aiService";

const AIWritingAssistant = ({ content, cursorPosition, onSuggestionApply }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAnalyzedContent, setLastAnalyzedContent] = useState("");

  // Debounced function for getting suggestions
  const debouncedGetSuggestions = useCallback(
    aiService.debounce(async (text, position) => {
      if (!text.trim() || text.length < 20) {
        setSuggestions([]);
        setIsVisible(false);
        return;
      }

      // Only analyze if content has changed significantly
      if (
        Math.abs(text.length - lastAnalyzedContent.length) < 10 &&
        text.substring(0, Math.min(text.length, lastAnalyzedContent.length)) ===
          lastAnalyzedContent.substring(
            0,
            Math.min(text.length, lastAnalyzedContent.length)
          )
      ) {
        return;
      }

      setIsLoading(true);
      try {
        const suggestion = await aiService.getSmartSuggestions(text, position);
        if (suggestion) {
          setSuggestions([
            {
              type: "smart",
              content: suggestion,
              title: "AI Suggestion",
            },
          ]);
          setIsVisible(true);
          setLastAnalyzedContent(text);
        }
      } catch (error) {
        console.error("Error getting suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    }, 2000), // 2 second delay
    [lastAnalyzedContent]
  );

  useEffect(() => {
    if (content && content.length > 20) {
      debouncedGetSuggestions(content, cursorPosition);
    } else {
      setSuggestions([]);
      setIsVisible(false);
    }
  }, [content, cursorPosition, debouncedGetSuggestions]);

  const applySuggestion = (suggestion) => {
    if (onSuggestionApply) {
      onSuggestionApply(suggestion);
    }
    setIsVisible(false);
    setSuggestions([]);
  };

  const dismissSuggestions = () => {
    setIsVisible(false);
    setSuggestions([]);
  };

  if (!isVisible && !isLoading) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-800">
            {isLoading ? "Analyzing..." : "AI Suggestions"}
          </h4>
          <button
            onClick={dismissSuggestions}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="border border-gray-100 rounded p-3">
                <div className="text-sm text-gray-600 mb-2">
                  {suggestion.content}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => applySuggestion(suggestion.content)}
                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    Apply
                  </button>
                  <button
                    onClick={dismissSuggestions}
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIWritingAssistant;
