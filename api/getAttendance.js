import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export default async function handler(req, res) {
    try {
        // Check if environment variables are present
        if (!process.env.FIREBASE_API_KEY || !process.env.FIREBASE_AUTH_DOMAIN || !process.env.FIREBASE_PROJECT_ID ||
            !process.env.FIREBASE_STORAGE_BUCKET || !process.env.FIREBASE_MESSAGING_SENDER_ID || !process.env.FIREBASE_APP_ID) {
            console.error("Missing Firebase environment variables!");
            return res.status(500).json({ error: "Missing Firebase environment variables" });
        }

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

        console.log("Firebase Initialized Securely");

        // Send success response
        res.status(200).json({ message: 'Firebase Initialized' });
    } catch (error) {
        // Catch and log any errors that happen during initialization
        console.error("Error initializing Firebase:", error);
        res.status(500).json({ error: 'Firebase Initialization Failed', details: error.message });
    }
}
