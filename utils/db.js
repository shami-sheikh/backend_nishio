
import mongoose from "mongoose";
const URI = process.env.MONGO_URI;
const db = async () => {
  if (!URI) {
    throw new Error(
      "MONGO_URI is not defined. Check .env and dotenv configuration.",
    );
  }
  try {
    await mongoose.connect(URI);
    console.log("mongoose connected");
  } catch (error) {
    console.log("mongoose connection faild", error.message);
  }
};
export default db;
