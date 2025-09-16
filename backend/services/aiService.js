const { OpenAI } = require("openai");

// Initialize OpenRouter client with Gemma 3 27B model
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1/",
});

const GEMMA_MODEL = "google/gemma-3-27b-it:free";

class AIService {
  constructor() {
    this.model = GEMMA_MODEL;
  }

  // Analyze markdown content for automatic tagging
  async generateTags(content) {
    try {
      const prompt = `Analyze the following markdown content and generate 3-7 relevant tags that describe the main topics, themes, or categories. Return only the tags as a comma-separated list, no other text.

Content:
${content}

Tags:`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert content analyzer. Generate concise, relevant tags for markdown content. Return only tags separated by commas.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 100,
      });

      const tags =
        response.choices[0]?.message?.content
          ?.split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag.length > 0) || [];

      return tags;
    } catch (error) {
      console.error("Error generating tags:", error);
      return [];
    }
  }

  // Provide real-time writing assistance
  async getWritingAssistance(content, cursorPosition, userQuery = "") {
    try {
      const beforeCursor = content.substring(0, cursorPosition);
      const afterCursor = content.substring(cursorPosition);

      let prompt = `You are an AI assistant helping with markdown writing. The user is currently writing:

Content before cursor:
${beforeCursor}

Content after cursor:
${afterCursor}

Current cursor position is between these sections.`;

      if (userQuery) {
        prompt += `\n\nUser's specific request: ${userQuery}`;
      } else {
        prompt += `\n\nProvide helpful suggestions for continuing the content, improving markdown syntax, or completing the current thought. Be concise and specific.`;
      }

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are a markdown writing assistant. Provide helpful, actionable suggestions to improve writing and markdown formatting. Be concise.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      return (
        response.choices[0]?.message?.content || "No suggestions available."
      );
    } catch (error) {
      console.error("Error getting writing assistance:", error);
      return "Unable to provide assistance at the moment.";
    }
  }

  // Generate markdown syntax suggestions
  async getMarkdownSuggestions(context, syntaxType) {
    try {
      const prompt = `Help the user create ${syntaxType} in markdown format. 

Context: ${context}

Provide the exact markdown syntax they need, with a brief explanation. Focus on proper formatting and best practices.`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are a markdown syntax expert. Provide clear, accurate markdown formatting examples with brief explanations.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 300,
      });

      return (
        response.choices[0]?.message?.content ||
        "No syntax suggestions available."
      );
    } catch (error) {
      console.error("Error getting markdown suggestions:", error);
      return "Unable to provide syntax suggestions.";
    }
  }

  // Summarize content
  async summarizeContent(content) {
    try {
      const prompt = `Summarize the following markdown content in 2-3 sentences. Focus on key points and main ideas:

${content}`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are a content summarization expert. Create concise, informative summaries that capture the essence of the content.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 150,
      });

      return (
        response.choices[0]?.message?.content || "Unable to summarize content."
      );
    } catch (error) {
      console.error("Error summarizing content:", error);
      return "Unable to summarize content.";
    }
  }

  // Rephrase content
  async rephraseContent(content, style = "clear") {
    try {
      const prompt = `Rephrase the following content to make it ${style} and more engaging while maintaining the original meaning:

${content}`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are a writing improvement assistant. Rephrase content to be clearer, more engaging, and better structured while preserving the original meaning.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      return (
        response.choices[0]?.message?.content || "Unable to rephrase content."
      );
    } catch (error) {
      console.error("Error rephrasing content:", error);
      return "Unable to rephrase content.";
    }
  }

  // General AI chat for the overlay
  async chatAssistant(message, noteContent = "") {
    try {
      let prompt = message;

      if (noteContent) {
        prompt = `Based on the current note content below, please help with: ${message}

Current note content:
${noteContent}`;
      }

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful AI assistant specializing in markdown note-taking, writing assistance, and content organization. Provide clear, actionable advice.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 400,
      });

      return (
        response.choices[0]?.message?.content ||
        "I apologize, but I cannot provide assistance at the moment."
      );
    } catch (error) {
      console.error("Error in chat assistant:", error);
      return "I apologize, but I cannot provide assistance at the moment.";
    }
  }

  // Analyze content for real-time feedback
  async analyzeContent(content) {
    try {
      const prompt = `Analyze this markdown content and provide brief feedback on:
1. Writing quality and clarity
2. Structure and organization  
3. Markdown formatting
4. Suggestions for improvement

Content:
${content}

Keep feedback concise and actionable.`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are a content analysis expert. Provide brief, actionable feedback on writing quality, structure, and formatting.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 250,
      });

      return response.choices[0]?.message?.content || "No analysis available.";
    } catch (error) {
      console.error("Error analyzing content:", error);
      return "Unable to analyze content.";
    }
  }

  // Lightweight markdown help - optimized for minimal token usage
  async getMarkdownHelp(request) {
    try {
      const prompt = `Help with this markdown request: "${request}". Provide a concise, practical markdown example or solution. Focus on exact syntax.`;

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are a markdown syntax expert. Provide clear, concise markdown examples and syntax help. Be brief and practical.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 150,
      });

      return (
        response.choices[0]?.message?.content ||
        "Here are some common markdown patterns:\n\n**Bold**: `**text**`\n*Italic*: `*text*`\n[Link](url): `[text](url)`\n# Header: `# text`\n- List: `- item`"
      );
    } catch (error) {
      console.error("Error getting markdown help:", error);
      return "Here are some common markdown patterns:\n\n**Bold**: `**text**`\n*Italic*: `*text*`\n[Link](url): `[text](url)`\n# Header: `# text`\n- List: `- item`";
    }
  }
}

module.exports = new AIService();
