import { cert, initializeApp } from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth"
if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error("FIREBASE_PRIVATE_ID is missing — check your .env file");
}
if (!process.env.FIREBASE_CLIENT_EMAIL) {
  throw new Error("FIREBASE_CLIENT_EMAIL is missing — check your .env file");
}
if (!process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error("FIREBASE_PRIVATE_KEY is missing — check your .env file");
}
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
};
const app = initializeApp({
  credential: cert(serviceAccount),
});
export const auth = getAuth(app);
export default app;