import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { name } = req.body;

    try {
        const attendanceQuery = query(
            collection(db, "attendance"),
            where("name", "==", name)
        );
        const querySnapshot = await getDocs(attendanceQuery);

        // Return true if a duplicate is found, otherwise false
        res.status(200).json({ exists: !querySnapshot.empty });
    } catch (error) {
        res.status(500).json({ error: "Failed to check for duplicates" });
    }
}
