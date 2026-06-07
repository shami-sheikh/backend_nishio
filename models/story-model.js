import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ["image", "video"], required: true },
  text: { type: String, default: "" },        // text ke liye 
  emoji: { type: String, default: "" },       // emoji ke liye
  views: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // kon dekha viewed
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }, // 24hr
}, { timestamps: true });

// auto delete after 24 hours
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Story = mongoose.model("Story", storySchema);
export default Story;