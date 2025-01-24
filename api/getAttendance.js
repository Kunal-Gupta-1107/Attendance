import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export default async function handler(req, res) {
    // Securely accessing environment variables set in Vercel
    const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
    };

    try {
        // Initialize Firebase with the configuration from the environment
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        // You can now perform Firebase operations with `db`
        // For example, querying data from Firestore
        // Here you can add code to interact with Firestore if needed.

        res.status(200).json({ message: 'Firebase Initialized securely' });
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        res.status(500).json({ error: 'Firebase Initialization Failed' });
    }
}
