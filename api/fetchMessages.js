import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to return the collection ID for today's messages
function getTodayCollectionId() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Ensure two digits for month
    const day = String(today.getDate()).padStart(2, '0'); // Ensure two digits for day
    return `${year}-${month}-${day}`; // Format as "YYYY-MM-DD"
}

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const collectionId = getTodayCollectionId(); // Get today's collection ID
        const messagesRef = collection(db, `group_chats/${collectionId}/messages`);
        const querySnapshot = await getDocs(messagesRef);

        let messagesArray = [];
        querySnapshot.forEach((doc) => {
            const messageData = doc.data();
            messagesArray.push({
                message: messageData.message,
                sender: messageData.sender,
                time: messageData.time.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            });
        });

        // Reverse the array so the latest messages appear last
        messagesArray.reverse();

        res.status(200).json({ messages: messagesArray });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Failed to fetch messages", details: error.message });
    }
}
