import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["photo", "reel"],
    required: true,
  },
  mediaUrl: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    default: null,
  },
  caption: {
    type: String,
    trim: true,
    maxlength: 2200,
    default: "",
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  // ✅ Added
  saved: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  views: {
    type: Number,
    default: 0,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const Post = mongoose.model("Post", postSchema);
export default Post;