import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import MarkdownPreview from "@uiw/react-markdown-preview";
import "@uiw/react-markdown-preview/markdown.css";
import { noteService } from "../services/noteService";

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

const NoteEditor = () => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

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
      {/* Add custom styles for list rendering */}
      <style>{listStyles}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 font-medium"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Edit Note" : "Create New Note"}
          </h1>
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

          {/* Side-by-Side Editor and Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Markdown Editor */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Content (Markdown)
              </label>
              <div className="text-xs text-gray-500 mb-2">
                💡 Supports all markdown features: **bold**, *italic*, tables,
                code blocks, lists, and more!
              </div>
              <textarea
                name="content"
                placeholder="# My Note Title

Write your note in **Markdown** format...

## Features Supported
- Tables
- Code blocks
- Lists
- Links
- Images
- And much more!

```javascript
console.log('Hello, MarkSense!');
```

| Feature | Status |
|---------|--------|
| Tables  | ✅ Working |
| Code    | ✅ Working |"
                value={formData.content}
                onChange={handleChange}
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
    </div>
  );
};

export default NoteEditor;
