import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { noteService } from "../services/noteService";

const NoteEditor = () => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      fetchNote();
    }
  }, [id]);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? "Edit Note" : "Create New Note"}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                {preview ? "Edit" : "Preview"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                name="title"
                placeholder="Note title..."
                value={formData.title}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Editor */}
              <div className={`${preview ? "hidden lg:block" : ""}`}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Markdown Content
                </label>
                <textarea
                  name="content"
                  placeholder="Write your note in Markdown..."
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={20}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>

              {/* Preview */}
              <div className={`${!preview ? "hidden lg:block" : ""}`}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="h-96 lg:h-auto border border-gray-300 rounded-md p-4 bg-white overflow-auto">
                  <ReactMarkdown className="prose prose-sm max-w-none">
                    {formData.content || "*Preview will appear here...*"}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
