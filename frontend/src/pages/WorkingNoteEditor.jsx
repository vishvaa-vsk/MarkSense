import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { noteService } from "../services/noteService";

// Error boundary for markdown preview
class MarkdownErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, lastContent: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Markdown rendering error:", error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    // Reset error state when content changes
    if (prevProps.content !== this.props.content && this.state.hasError) {
      this.setState({ hasError: false, lastContent: this.props.content });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-orange-600 p-4 bg-orange-50 rounded border">
          <p className="font-medium">Preview temporarily unavailable</p>
          <p className="text-sm">
            Showing raw content while we fix the preview:
          </p>
          <div className="mt-2 p-2 bg-white rounded border">
            <pre className="text-xs whitespace-pre-wrap text-gray-700">
              {this.props.content}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Temporary simple preview without ReactMarkdown to isolate the issue
const SafeMarkdownPreview = ({ content }) => {
  // Don't render if content is empty
  if (!content || content.trim() === "") {
    return (
      <p className="text-gray-500 italic">Start typing to see preview...</p>
    );
  }

  // Show raw content for now to test if ReactMarkdown is the issue
  return (
    <div className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-4 rounded">
      {content}
    </div>
  );
};

const WorkingNoteEditor = () => {
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
    console.log("handleChange called with:", e.target.name, e.target.value);
    try {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
      console.log("State update successful");
    } catch (error) {
      console.error("Error in handleChange:", error);
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
      console.error("Error saving note:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Edit Note" : "Create New Note"}
          </h1>
          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Enter note title..."
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Content (Markdown)
              </label>
              <textarea
                id="content"
                name="content"
                placeholder="Write your note in Markdown..."
                value={formData.content}
                onChange={handleChange}
                required
                rows={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div className="border border-gray-300 rounded-lg p-4 bg-white min-h-[500px] overflow-auto">
                <div className="prose prose-sm max-w-none">
                  <SafeMarkdownPreview content={formData.content} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6">
            <Link
              to="/dashboard"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkingNoteEditor;
