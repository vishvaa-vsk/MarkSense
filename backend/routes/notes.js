const express = require("express");
const Note = require("../models/Note");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/notes
// @desc    Get all notes for logged-in user
// @access  Private
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id }).sort({
      updatedAt: -1,
    });

    res.json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching notes",
    });
  }
});

// @route   GET /api/notes/:id
// @desc    Get single note by ID
// @access  Private
router.get("/:id", async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.json({
      success: true,
      data: note,
    });
  } catch (error) {
    console.error("Get note error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching note",
    });
  }
});

// @route   POST /api/notes
// @desc    Create a new note
// @access  Private
router.post("/", async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const note = new Note({
      userId: req.user._id,
      title,
      content,
      tags: tags || [],
    });

    await note.save();

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: note,
    });
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while creating note",
    });
  }
});

// @route   PUT /api/notes/:id
// @desc    Update an existing note
// @access  Private
router.put("/:id", async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    note.title = title || note.title;
    note.content = content || note.content;
    if (tags !== undefined) {
      note.tags = tags;
    }

    await note.save();

    res.json({
      success: true,
      message: "Note updated successfully",
      data: note,
    });
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while updating note",
    });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete("/:id", async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting note",
    });
  }
});

module.exports = router;
