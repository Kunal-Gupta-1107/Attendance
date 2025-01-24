// api/addAttendance.js

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);  // Initialize Firebase Admin SDK
const db = getFirestore(app);  // Get Firestore reference

// Handle API request
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const data = req.body; // Data sent from frontend
      const docRef = await db.collection('attendance').add(data);  // Save data to Firestore
      res.status(200).json({ success: true, id: docRef.id });
    } catch (error) {
      res.status(500).json({ error: 'Error saving data: ' + error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });  // Handle invalid methods
  }
}
