import mongoose from "mongoose";

const reelSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, default: null },
  caption: { type: String, trim: true, maxlength: 2200, default: "" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  views: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
  saved: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

const Reel = mongoose.model("Reel", reelSchema);
export default Reel;