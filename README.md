# MarkSense - Markdown Note-Taking App

A modern, full-stack note-taking application built with the MERN stack (MongoDB, Express.js, React, Node.js) that supports Markdown editing and real-time preview.

## Features

- **User Authentication**: Secure user registration and login
- **Markdown Editor**: Write notes in Markdown with live preview
- **Note Management**: Create, edit, delete, and organize your notes
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Preview**: See your Markdown rendered as you type
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS

## Tech Stack

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

### Frontend

- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API requests
- **React Markdown** for rendering

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd MarkSense
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/marksense
JWT_SECRET=your-super-secret-jwt-key-here-please-change-in-production
JWT_EXPIRE=7d
```

**Important**: Replace the JWT_SECRET with a strong, random secret key in production.

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Database Setup

Make sure MongoDB is running on your system:

- **Local MongoDB**: Start the MongoDB service
- **MongoDB Atlas**: Update the MONGODB_URI in the backend `.env` file with your connection string

## Running the Application

### Development Mode

1. **Start the Backend** (from the backend directory):

```bash
npm run dev
```

The backend will run on http://localhost:5000

2. **Start the Frontend** (from the frontend directory):

```bash
npm run dev
```

The frontend will run on http://localhost:5173

### Production Mode

1. **Build the Frontend**:

```bash
cd frontend
npm run build
```

2. **Start the Backend**:

```bash
cd ../backend
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Notes

- `GET /api/notes` - Get all notes for the authenticated user
- `GET /api/notes/:id` - Get a specific note
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update an existing note
- `DELETE /api/notes/:id` - Delete a note

## Project Structure

```
MarkSense/
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Note.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── notes.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── NoteEditor.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── noteService.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Usage

1. **Register/Login**: Create a new account or login with existing credentials
2. **Dashboard**: View all your notes in a grid layout
3. **Create Note**: Click "New Note" to create a new note with Markdown support
4. **Edit Note**: Click "Edit" on any note to modify it
5. **Preview**: Toggle between edit and preview modes while writing
6. **Delete Note**: Remove notes you no longer need

## Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Protected routes on both frontend and backend
- Input validation and sanitization
- CORS configuration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.
