const express = require("express");
const aiService = require("../services/aiService");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Generate tags for content
router.post("/generate-tags", authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const tags = await aiService.generateTags(content);
    res.json({ tags });
  } catch (error) {
    console.error("Error generating tags:", error);
    res.status(500).json({ error: "Failed to generate tags" });
  }
});

// Get writing assistance
router.post("/writing-assistance", authMiddleware, async (req, res) => {
  try {
    const { content, cursorPosition, userQuery } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const assistance = await aiService.getWritingAssistance(
      content,
      cursorPosition || 0,
      userQuery
    );
    res.json({ assistance });
  } catch (error) {
    console.error("Error getting writing assistance:", error);
    res.status(500).json({ error: "Failed to provide writing assistance" });
  }
});

// Get markdown syntax suggestions
router.post("/markdown-suggestions", authMiddleware, async (req, res) => {
  try {
    const { context, syntaxType } = req.body;

    if (!context || !syntaxType) {
      return res
        .status(400)
        .json({ error: "Context and syntax type are required" });
    }

    const suggestions = await aiService.getMarkdownSuggestions(
      context,
      syntaxType
    );
    res.json({ suggestions });
  } catch (error) {
    console.error("Error getting markdown suggestions:", error);
    res.status(500).json({ error: "Failed to provide markdown suggestions" });
  }
});

// Summarize content
router.post("/summarize", authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const summary = await aiService.summarizeContent(content);
    res.json({ summary });
  } catch (error) {
    console.error("Error summarizing content:", error);
    res.status(500).json({ error: "Failed to summarize content" });
  }
});

// Rephrase content
router.post("/rephrase", authMiddleware, async (req, res) => {
  try {
    const { content, style } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const rephrasedContent = await aiService.rephraseContent(content, style);
    res.json({ rephrasedContent });
  } catch (error) {
    console.error("Error rephrasing content:", error);
    res.status(500).json({ error: "Failed to rephrase content" });
  }
});

// AI chat assistant
router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { message, noteContent } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await aiService.chatAssistant(message, noteContent);
    res.json({ response });
  } catch (error) {
    console.error("Error in AI chat:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

// Analyze content
router.post("/analyze", authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const analysis = await aiService.analyzeContent(content);
    res.json({ analysis });
  } catch (error) {
    console.error("Error analyzing content:", error);
    res.status(500).json({ error: "Failed to analyze content" });
  }
});

// Lightweight markdown help - minimal token usage
router.post("/markdown-help", authMiddleware, async (req, res) => {
  try {
    const { request } = req.body;

    if (!request) {
      return res.status(400).json({ error: "Request is required" });
    }

    const help = await aiService.getMarkdownHelp(request);
    res.json({ help });
  } catch (error) {
    console.error("Error getting markdown help:", error);
    res.status(500).json({ error: "Failed to provide markdown help" });
  }
});

module.exports = router;
