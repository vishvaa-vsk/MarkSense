const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      maxlength: [10000, "Content cannot exceed 10000 characters"],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags) {
          return tags.length <= 10; // Limit to 10 tags
        },
        message: "Cannot have more than 10 tags",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add index for better query performance
noteSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Note", noteSchema);
