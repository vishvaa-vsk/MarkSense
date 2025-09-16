import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import MarkdownPreview from "@uiw/react-markdown-preview";
import "@uiw/react-markdown-preview/markdown.css";
import { noteService } from "../services/noteService";
import aiService from "../services/aiService";
import FloatingAIBot from "../components/FloatingAIBot";

// Add styles to ensure proper list rendering
const listStyles = `
  .wmde-markdown ul {
    list-style-type: disc !important;
    padding-left: 1.5rem !important;
    margin-bottom: 1rem !important;
  }
  .wmde-markdown ol {
    list-style-type: decimal !important;
    padding-left: 1.5rem !important;
    margin-bottom: 1rem !important;
  }
  .wmde-markdown li {
    display: list-item !important;
    margin-bottom: 0.5rem !important;
  }
  .wmde-markdown-var ul {
    list-style-type: disc !important;
    padding-left: 1.5rem !important;
  }
  .wmde-markdown-var ol {
    list-style-type: decimal !important;
    padding-left: 1.5rem !important;
  }
  .wmde-markdown-var li {
    display: list-item !important;
  }
  .w-md-editor-preview ul {
    list-style-type: disc !important;
    padding-left: 1.5rem !important;
    margin-bottom: 1rem !important;
  }
  .w-md-editor-preview ol {
    list-style-type: decimal !important;
    padding-left: 1.5rem !important;
    margin-bottom: 1rem !important;
  }
  .w-md-editor-preview li {
    display: list-item !important;
    margin-bottom: 0.5rem !important;
  }
`;

const EnhancedNoteEditor = () => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Simplified AI features state - only manual tagging
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      fetchNote();
    }
  }, [id, isEditing]);

  const fetchNote = async () => {
    try {
      const response = await noteService.getNoteById(id);
      if (response.success) {
        setFormData({
          title: response.data.title,
          content: response.data.content,
          tags: response.data.tags || [],
        });
      }
    } catch (error) {
      setError("Failed to fetch note");
      console.error("Error fetching note:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleContentChange = (e) => {
    setFormData({
      ...formData,
      content: e.target.value,
    });
  };

  const handleInsertContent = (content) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newContent =
        formData.content.substring(0, start) +
        "\n\n" +
        content +
        "\n\n" +
        formData.content.substring(end);

      setFormData((prev) => ({ ...prev, content: newContent }));

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + content.length + 4,
          start + content.length + 4
        );
      }, 0);
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagAdd = (newTag) => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()],
      }));
    }
  };

  // Manual tag generation function
  const generateTags = async () => {
    if (!formData.content.trim()) return;

    setIsGeneratingTags(true);
    try {
      const tags = await aiService.generateTags(formData.content);
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, ...tags.filter((tag) => !prev.tags.includes(tag))],
      }));
    } catch (error) {
      console.error("Error generating tags:", error);
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let response;
      if (isEditing) {
        response = await noteService.updateNote(id, formData);
      } else {
        response = await noteService.createNote(formData);
      }

      if (response.success) {
        navigate("/dashboard");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <style>{listStyles}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header with AI Tools */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 font-medium"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? "Edit Note" : "Create New Note"}
            </h1>

            {/* AI Tools */}
            <div className="flex items-center space-x-3">
              <button
                onClick={generateTags}
                disabled={isGeneratingTags || !formData.content.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                title="Generate AI Tags"
              >
                {isGeneratingTags ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>🏷️</span>
                )}
                <span>
                  {isGeneratingTags ? "Generating..." : "Generate Tags"}
                </span>
              </button>

              <div className="text-sm text-gray-600 flex items-center space-x-1">
                <span>🤖</span>
                <span>AI Bot available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="Enter your note title..."
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
              {isGeneratingTags && (
                <span className="text-blue-500"> (AI generating...)</span>
              )}
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add a tag and press Enter..."
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleTagAdd(e.target.value);
                  e.target.value = "";
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Side-by-Side Editor and Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Markdown Editor */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Content (Markdown) - AI Bot Available 🤖
              </label>
              <div className="text-xs text-gray-500 mb-2">
                💡 Click the floating AI bot for markdown help and syntax
                assistance!
              </div>
              <textarea
                ref={textareaRef}
                name="content"
                placeholder="# My Note Title

Write your note in **Markdown** format...

Use the floating AI bot 🤖 for help with:
- Tables and formatting
- Link syntax
- Code blocks
- Lists and structure
- And more!

Click the floating bot icon to get started!"
                value={formData.content}
                onChange={handleContentChange}
                required
                className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none overflow-y-auto"
              />
            </div>

            {/* Live Preview */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Live Preview
              </label>
              <div className="text-xs text-gray-500 mb-2">
                🚀 Real-time markdown preview with professional styling
              </div>
              <div className="border border-gray-300 rounded-lg bg-white overflow-hidden h-96">
                <div
                  data-color-mode="light"
                  data-md-color-mode="light"
                  className="w-md-editor-preview h-full overflow-y-auto"
                >
                  <MarkdownPreview
                    source={
                      formData.content || "Start typing to see the preview..."
                    }
                    style={{
                      backgroundColor: "white",
                      padding: "1.5rem",
                      minHeight: "100%",
                      fontSize: "14px",
                      lineHeight: "1.6",
                    }}
                    wrapperElement={{
                      "data-color-mode": "light",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Link
              to="/dashboard"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-8 py-3 rounded-lg transition-colors flex items-center space-x-2"
            >
              {loading && (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              <span>
                {loading
                  ? "Saving..."
                  : isEditing
                  ? "Update Note"
                  : "Save Note"}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Floating AI Bot */}
      <FloatingAIBot
        noteContent={formData.content}
        onInsertContent={handleInsertContent}
      />
    </div>
  );
};

export default EnhancedNoteEditor;
