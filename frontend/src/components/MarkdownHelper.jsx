import React, { useState } from "react";
import aiService from "../services/aiService";

const MarkdownHelper = ({ onInsertMarkdown, isVisible, onClose }) => {
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [customContext, setCustomContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");

  const markdownHelpers = [
    {
      id: "table",
      title: "Table",
      description: "Create a markdown table",
      icon: "📊",
      prompt:
        'Describe the table you want to create (e.g., "comparison of programming languages")',
    },
    {
      id: "link",
      title: "Link",
      description: "Format links and references",
      icon: "🔗",
      prompt:
        'Describe the link you want to create (e.g., "link to React documentation")',
    },
    {
      id: "code_block",
      title: "Code Block",
      description: "Format code with syntax highlighting",
      icon: "💻",
      prompt:
        'Describe the code block (e.g., "JavaScript function for sorting")',
    },
    {
      id: "list",
      title: "List",
      description: "Create ordered or unordered lists",
      icon: "📝",
      prompt:
        'Describe the list you want to create (e.g., "todo list for project")',
    },
    {
      id: "heading",
      title: "Heading Structure",
      description: "Organize content with proper headings",
      icon: "📋",
      prompt:
        'Describe the document structure you need (e.g., "blog post about AI")',
    },
    {
      id: "blockquote",
      title: "Quote",
      description: "Format quotes and citations",
      icon: "💬",
      prompt: "Describe the quote or citation you want to format",
    },
  ];

  const handleHelperSelect = (helper) => {
    setSelectedHelper(helper);
    setResult("");
    setCustomContext("");
  };

  const generateMarkdown = async () => {
    if (!selectedHelper || !customContext.trim()) return;

    setIsLoading(true);
    try {
      const suggestions = await aiService.getMarkdownSuggestions(
        customContext,
        selectedHelper.id
      );
      setResult(suggestions);
    } catch (error) {
      console.error("Error generating markdown:", error);
      setResult("Error generating markdown. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const insertMarkdown = () => {
    if (result && onInsertMarkdown) {
      onInsertMarkdown(result);
      onClose();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Markdown Helper
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {!selectedHelper ? (
            <div className="grid grid-cols-2 gap-3">
              {markdownHelpers.map((helper) => (
                <button
                  key={helper.id}
                  onClick={() => handleHelperSelect(helper)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{helper.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {helper.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {helper.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedHelper(null)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  ← Back
                </button>
                <h4 className="text-lg font-medium text-gray-800">
                  {selectedHelper.icon} {selectedHelper.title}
                </h4>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedHelper.prompt}
                </label>
                <textarea
                  value={customContext}
                  onChange={(e) => setCustomContext(e.target.value)}
                  placeholder={`Example: ${selectedHelper.prompt.toLowerCase()}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <button
                onClick={generateMarkdown}
                disabled={!customContext.trim() || isLoading}
                className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Generating..." : "Generate Markdown"}
              </button>

              {result && (
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded-lg">
                    <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Generated Markdown
                      </span>
                      <button
                        onClick={copyToClipboard}
                        className="text-sm text-blue-500 hover:text-blue-700"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="p-3">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {result}
                      </pre>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={insertMarkdown}
                      className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Insert into Note
                    </button>
                    <button
                      onClick={() => setResult("")}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkdownHelper;
