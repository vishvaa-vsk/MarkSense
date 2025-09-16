import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Create axios instance with default config
const aiAPI = axios.create({
  baseURL: `${API_BASE_URL}/ai`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
aiAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class AIService {
  // Generate tags for content
  async generateTags(content) {
    try {
      const response = await aiAPI.post("/generate-tags", { content });
      return response.data.tags || [];
    } catch (error) {
      console.error("Error generating tags:", error);
      return [];
    }
  }

  // Get writing assistance
  async getWritingAssistance(content, cursorPosition, userQuery = "") {
    try {
      const response = await aiAPI.post("/writing-assistance", {
        content,
        cursorPosition,
        userQuery,
      });
      return response.data.assistance || "No assistance available";
    } catch (error) {
      console.error("Error getting writing assistance:", error);
      return "Unable to provide assistance at the moment.";
    }
  }

  // Get markdown syntax suggestions
  async getMarkdownSuggestions(context, syntaxType) {
    try {
      const response = await aiAPI.post("/markdown-suggestions", {
        context,
        syntaxType,
      });
      return response.data.suggestions || "No suggestions available";
    } catch (error) {
      console.error("Error getting markdown suggestions:", error);
      return "Unable to provide suggestions.";
    }
  }

  // Summarize content
  async summarizeContent(content) {
    try {
      const response = await aiAPI.post("/summarize", { content });
      return response.data.summary || "Unable to summarize content";
    } catch (error) {
      console.error("Error summarizing content:", error);
      return "Unable to summarize content.";
    }
  }

  // Rephrase content
  async rephraseContent(content, style = "clear") {
    try {
      const response = await aiAPI.post("/rephrase", { content, style });
      return response.data.rephrasedContent || "Unable to rephrase content";
    } catch (error) {
      console.error("Error rephrasing content:", error);
      return "Unable to rephrase content.";
    }
  }

  // AI chat assistant
  async chatAssistant(message, noteContent = "") {
    try {
      const response = await aiAPI.post("/chat", { message, noteContent });
      return (
        response.data.response ||
        "I apologize, but I cannot provide assistance at the moment."
      );
    } catch (error) {
      console.error("Error in AI chat:", error);
      return "I apologize, but I cannot provide assistance at the moment.";
    }
  }

  // Analyze content
  async analyzeContent(content) {
    try {
      const response = await aiAPI.post("/analyze", { content });
      return response.data.analysis || "No analysis available";
    } catch (error) {
      console.error("Error analyzing content:", error);
      return "Unable to analyze content.";
    }
  }

  // Debounced function creator for real-time features
  debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Get smart suggestions based on current context
  async getSmartSuggestions(content, cursorPosition) {
    try {
      // Analyze the context around the cursor
      const beforeCursor = content.substring(
        Math.max(0, cursorPosition - 100),
        cursorPosition
      );
      const afterCursor = content.substring(
        cursorPosition,
        Math.min(content.length, cursorPosition + 100)
      );

      // Detect what kind of help might be needed
      const lastLine = beforeCursor.split("\n").pop();

      let suggestionType = "general";
      let context = lastLine;

      if (lastLine.includes("|") && !lastLine.includes("||")) {
        suggestionType = "table";
        context = "Creating a table";
      } else if (lastLine.match(/^#+\s*/)) {
        suggestionType = "heading";
        context = "Creating a heading";
      } else if (lastLine.includes("[") && !lastLine.includes("]")) {
        suggestionType = "link";
        context = "Creating a link";
      } else if (lastLine.includes("```")) {
        suggestionType = "code_block";
        context = "Creating a code block";
      }

      if (suggestionType !== "general") {
        return await this.getMarkdownSuggestions(context, suggestionType);
      }

      return await this.getWritingAssistance(content, cursorPosition);
    } catch (error) {
      console.error("Error getting smart suggestions:", error);
      return null;
    }
  }

  // Get specific markdown help - optimized for minimal token usage
  async getMarkdownHelp(request) {
    try {
      // Determine the type of help needed and provide context-specific assistance
      const lowerRequest = request.toLowerCase();

      if (lowerRequest.includes("table")) {
        return await this.getMarkdownSuggestions(request, "table");
      } else if (lowerRequest.includes("link")) {
        return await this.getMarkdownSuggestions(request, "link");
      } else if (lowerRequest.includes("code")) {
        return await this.getMarkdownSuggestions(request, "code_block");
      } else if (lowerRequest.includes("list")) {
        return await this.getMarkdownSuggestions(request, "list");
      } else if (
        lowerRequest.includes("header") ||
        lowerRequest.includes("heading")
      ) {
        return await this.getMarkdownSuggestions(request, "heading");
      } else if (lowerRequest.includes("quote")) {
        return await this.getMarkdownSuggestions(request, "blockquote");
      } else {
        // For general markdown help, use a lightweight approach
        const response = await aiAPI.post("/markdown-help", { request });
        return (
          response.data.help ||
          "Here are some common markdown patterns:\n\n**Bold text**: `**text**`\n*Italic text*: `*text*`\n[Link](url): `[text](url)`\n# Header: `# text`\n- List item: `- text`"
        );
      }
    } catch (error) {
      console.error("Error getting markdown help:", error);
      return "Here are some common markdown patterns:\n\n**Bold text**: `**text**`\n*Italic text*: `*text*`\n[Link](url): `[text](url)`\n# Header: `# text`\n- List item: `- text`";
    }
  }
}

export default new AIService();
