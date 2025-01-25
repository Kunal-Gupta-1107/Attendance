// api/getAttendance.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Initialize Firebase
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase App
try {
  console.log("Firebase config:", firebaseConfig); // Log config for debugging
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
} catch (error) {
  console.error("Firebase Initialization Error:", error);
  throw error; // Re-throw to trigger catch block in handler
}
// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// API handler function
export default async function handler(req, res) {
    try {
        if (req.method === "GET") {
            // Return Firebase configuration as response
            res.status(200).json({
                apiKey: process.env.FIREBASE_API_KEY,
                authDomain: process.env.FIREBASE_AUTH_DOMAIN,
                projectId: process.env.FIREBASE_PROJECT_ID,
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.FIREBASE_APP_ID,
            });
        } else {
            res.status(405).json({ error: "Method Not Allowed" });
        }
    } catch (error) {
        console.error("Firebase Initialization Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
