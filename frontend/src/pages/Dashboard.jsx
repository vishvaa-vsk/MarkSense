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

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
              <span className="ml-4 text-sm text-gray-500">
                Welcome, {user?.username}!
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/create-note"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                New Note
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

      {/* Main content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {notes.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No notes
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new note.
              </p>
              <div className="mt-6">
                <Link
                  to="/create-note"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create your first note
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <div
                  key={note._id}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {note.title}
                      </h3>
                      <div className="flex space-x-2">
                        <Link
                          to={`/edit-note/${note._id}`}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      {/* Markdown Preview */}
                      <div className="mt-2 text-sm text-gray-600 h-24 overflow-hidden dashboard-markdown">
                        <MarkdownPreview
                          source={note.content}
                          style={{
                            backgroundColor: "transparent",
                            padding: 0,
                            fontSize: "0.875rem",
                            lineHeight: "1.4",
                          }}
                          className="prose prose-sm max-w-none"
                        />
                      </div>
                      {/* Fade overlay for long content */}
                      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                      Last updated:{" "}
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
