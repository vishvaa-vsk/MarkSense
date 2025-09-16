import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MarkdownPreview from "@uiw/react-markdown-preview";
import "@uiw/react-markdown-preview/markdown.css";
import { useAuth } from "../context/AuthContext";
import { noteService } from "../services/noteService";

// Custom styles for dashboard markdown preview
const dashboardMarkdownStyles = `
  .dashboard-markdown h1, .dashboard-markdown h2, .dashboard-markdown h3 {
    margin: 0.25rem 0;
    font-size: 1em;
    font-weight: 600;
  }
  .dashboard-markdown p {
    margin: 0.25rem 0;
  }
  .dashboard-markdown ul, .dashboard-markdown ol {
    margin: 0.25rem 0;
    padding-left: 1.5rem;
  }
  .dashboard-markdown li {
    margin: 0.125rem 0;
  }
  .dashboard-markdown code {
    background-color: #f3f4f6;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-size: 0.8em;
  }
  .dashboard-markdown blockquote {
    border-left: 2px solid #e5e7eb;
    margin: 0.25rem 0;
    padding-left: 0.75rem;
    color: #6b7280;
  }
`;

const EnhancedDashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { user, logout } = useAuth();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await noteService.getAllNotes();
      if (response.success) {
        setNotes(response.data);
      }
    } catch (error) {
      setError("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await noteService.deleteNote(noteId);
        setNotes(notes.filter((note) => note._id !== noteId));
      } catch (error) {
        setError("Failed to delete note");
      }
    }
  };

  // Get all unique tags from notes
  const allTags = [...new Set(notes.flatMap((note) => note.tags || []))].sort();

  // Filter notes based on search term and selected tag
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag =
      !filterTag || (note.tags && note.tags.includes(filterTag));
    return matchesSearch && matchesTag;
  });

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Inject custom CSS */}
      <style>{dashboardMarkdownStyles}</style>

      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">MarkSense</h1>
              <span className="ml-4 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs rounded-full font-medium">
                AI-Powered ✨
              </span>
              <span className="ml-4 text-sm text-gray-500">
                Welcome, {user?.username}!
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/enhanced-editor"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md transition-all duration-200 flex items-center space-x-2"
              >
                <span>🤖</span>
                <span>New AI Note</span>
              </Link>
              <Link
                to="/create-note"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Classic Editor
              </Link>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tag Filter */}
              <div className="md:w-64">
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Tags</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags Overview */}
            {allTags.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Popular tags:</p>
                <div className="flex flex-wrap gap-2">
                  {allTags.slice(0, 10).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setFilterTag(tag === filterTag ? "" : tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        filterTag === tag
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Notes Stats */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">
                {notes.length}
              </div>
              <div className="text-gray-600">Total Notes</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">
                {allTags.length}
              </div>
              <div className="text-gray-600">Unique Tags</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">
                {filteredNotes.length}
              </div>
              <div className="text-gray-600">Filtered Results</div>
            </div>
          </div>

          {/* Notes Grid */}
          {filteredNotes.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map((note) => (
                <div
                  key={note._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {note.title}
                      </h3>
                      <div className="flex space-x-2 ml-4">
                        <Link
                          to={`/enhanced-editor/${note._id}`}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit with AI"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1">
                        {note.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                            onClick={() => setFilterTag(tag)}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="dashboard-markdown mb-4 text-sm text-gray-600 overflow-hidden">
                      <MarkdownPreview
                        source={truncateText(note.content)}
                        style={{
                          backgroundColor: "transparent",
                          padding: "0",
                          fontSize: "0.875rem",
                          lineHeight: "1.4",
                        }}
                        wrapperElement={{
                          "data-color-mode": "light",
                        }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Updated {formatDate(note.updatedAt)}</span>
                      <Link
                        to={`/enhanced-editor/${note._id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Open with AI →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterTag
                  ? "No matching notes found"
                  : "No notes yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterTag
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first AI-enhanced markdown note to get started!"}
              </p>
              {!searchTerm && !filterTag && (
                <Link
                  to="/enhanced-editor"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 space-x-2"
                >
                  <span>🤖</span>
                  <span>Create AI-Enhanced Note</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
