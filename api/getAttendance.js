import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// 🔒 Secure Firebase configuration (ENV variables must be set in Vercel)
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// 🔥 Initialize Firebase securely on the backend
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { name, attendanceCode, timestamp, date } = req.body;

        if (!name || !attendanceCode || !timestamp || !date) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // ✅ Add attendance to Firestore
        await addDoc(collection(db, "attendance"), {
            name,
            attendanceCode,
            timestamp: serverTimestamp(), // Use Firestore server timestamp
            date
        });

        res.status(200).json({ success: true, message: "Attendance added successfully" });

    } catch (error) {
        console.error("🔥 Firebase Error:", error);
        res.status(500).json({ error: "Failed to add attendance" });
    }
}
