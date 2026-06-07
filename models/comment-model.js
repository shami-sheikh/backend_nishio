import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  // ✅ Generic target (post or reel or story)
  targetType: { 
    type: String, 
    enum: ["Post", "Reel", "Story"],
    required: true 
  },
  targetId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: "targetType" // ✅ Dynamic reference based on targetType
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  text: { 
    type: String, 
    required: true,
    maxlength: 500 
  },
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  replies: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: { type: String, maxlength: 500 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;