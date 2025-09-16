import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { noteService } from "../services/noteService";

// Import highlight.js styles in index.css instead
// import "highlight.js/styles/github.css";

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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {isEditing ? "Edit Note" : "Create New Note"}
        </h1>

        <Link
          to="/dashboard"
          className="inline-block mb-6 text-blue-600 hover:text-blue-800"
        >
          ← Back to Dashboard
        </Link>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="Enter note title..."
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Side-by-Side Layout for Editor and Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content (Markdown)
              </label>
              <textarea
                name="content"
                placeholder="Write your note in Markdown..."
                value={formData.content}
                onChange={handleChange}
                required
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
            </div>

            {/* Live Preview Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Live Preview
              </label>
              <div className="border border-gray-300 rounded-md p-4 bg-white min-h-[500px] overflow-auto">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  className="prose prose-sm max-w-none"
                >
                  {formData.content || "*Start typing to see the preview...*"}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteEditor;
