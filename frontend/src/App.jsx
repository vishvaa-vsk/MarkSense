import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import NoteEditor from "./pages/NoteEditor";
import EnhancedNoteEditor from "./pages/EnhancedNoteEditor";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <EnhancedDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classic-dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enhanced-editor"
            element={
              <ProtectedRoute>
                <EnhancedNoteEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enhanced-editor/:id"
            element={
              <ProtectedRoute>
                <EnhancedNoteEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-note"
            element={
              <ProtectedRoute>
                <NoteEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-note/:id"
            element={
              <ProtectedRoute>
                <NoteEditor />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
