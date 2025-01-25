import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Securely load Firebase config from environment variables
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase (Only on the backend)
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { name, attendanceCode } = req.body;

        if (!name || !attendanceCode) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        await addDoc(collection(db, "attendance"), {
            name,
            attendanceCode,
            timestamp: serverTimestamp(),
            date: new Date().toLocaleDateString()
        });

        res.status(200).json({ success: true, message: "Attendance added successfully" });

    } catch (error) {
        console.error("🔥 Firebase Error:", error);
        res.status(500).json({ error: "Failed to add attendance" });
    }
}
