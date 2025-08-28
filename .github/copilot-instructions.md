# 📌 Project Setup

- Create a MERN stack project named `marksense`.

- Frontend → React + Vite with Tailwind CSS.

- Backend → Node.js + Express with MongoDB Atlas.

- Use JWT authentication and bcrypt for password hashing.

# 📌 Backend Instructions
1. Project Setup
```bash
mkdir backend && cd backend
npm init -y
npm install express mongoose bcryptjs jsonwebtoken cors dotenv
```

2. Server Boilerplate

- Create server.js with an Express app.

- Add middleware: cors, express.json(), dotenv.

- Connect to MongoDB Atlas.

3. Models

- User model → { username, email, password }

- Note model → { userId, title, content (markdown), createdAt, updatedAt }

4. Auth Routes

POST /api/auth/register → Register new user, hash password with bcrypt.

POST /api/auth/login → Validate credentials, return JWT.

5. Notes Routes (Protected with JWT Middleware)

GET /api/notes → Fetch all notes for logged-in user.

POST /api/notes → Create new note.

PUT /api/notes/:id → Update existing note.

DELETE /api/notes/:id → Delete note.

6. Middleware

authMiddleware.js → Verify JWT before allowing access to protected routes.

📌 Frontend Instructions
1. Project Setup
npm create vite@latest frontend --template react
cd frontend
npm install axios react-router-dom react-markdown tailwindcss

2. Pages

Login.jsx → Login form, calls /api/auth/login.

Register.jsx → Registration form, calls /api/auth/register.

Dashboard.jsx → Shows all notes, fetches from /api/notes.

Editor.jsx → Markdown editor with live preview (use react-markdown).

3. Auth Handling

Use localStorage to store JWT after login.

Add Axios interceptor to attach JWT in headers for API calls.

4. UI Features

Tailwind-based responsive layout.

Dashboard → List of notes with buttons (edit, delete).

Editor → Input textarea + markdown preview.

📌 Future Work (Next Phase)

AI integration (summarization & tagging with Gemini/OpenRouter).

Token-based AI usage limiter middleware.

Deployment with Render (backend) + Vercel/Netlify (frontend).