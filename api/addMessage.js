import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

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

    try {
        const { message, sender } = req.body;
        const collectionId = new Date().toISOString().split("T")[0]; // Get today's date as collection ID
        const messageRef = collection(db, `group_chats/${collectionId}/messages`);

        await addDoc(messageRef, {
            message: message,
            sender: sender,
            time: serverTimestamp()
        });

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to add message" });
    }
}
