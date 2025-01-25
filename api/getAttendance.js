import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// ✅ Initialize Firebase app
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        console.log("🔥 Fetching attendance data...");

        // ✅ Ensure Firestore query is correct
        const querySnapshot = await getDocs(collection(db, "attendance"));
        if (querySnapshot.empty) {
            console.warn("⚠️ No attendance records found.");
            return res.status(200).json({ attendance: [] });
        }

        const attendanceRecords = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            attendanceRecords.push({
                name: data.name || "Unknown",
                code: "Hidden",
                date: data.date || new Date().toISOString(),
                timestamp: data.timestamp ? data.timestamp.toMillis() : 0
            });
        });

        console.log("✅ Successfully fetched attendance data.");
        res.status(200).json({ attendance: attendanceRecords });

    } catch (error) {
        console.error("🔥 API ERROR:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
