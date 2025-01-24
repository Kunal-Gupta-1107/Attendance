// api/addAttendance.js

import { initializeApp } from 'firebase-admin/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK using environment variables (this won't expose keys)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig); // Initialize Firebase Admin SDK
const db = getFirestore(app); // Get Firestore reference

// API route to handle adding attendance to Firestore
export default async function handler(req, res) {
  if (!process.env.FIREBASE_API_KEY) {
        return res.status(500).json({ error: "Firebase API key is missing!" });
    }
  if (req.method === 'POST') {
    try {
      const { name, attendanceCode, timestamp, date } = req.body;

      // Add attendance data to Firestore
      const docRef = await addDoc(collection(db, 'attendance'), {
        name: name,
        attendanceCode: attendanceCode,
        timestamp: timestamp || serverTimestamp(),
        date: date,
      });
  
      // Respond with success
      res.status(200).json({ success: true, id: docRef.id });
    } catch (error) {
      res.status(500).json({ error: 'Error adding attendance: ' + error.message });
    }
  } else {
    // Handle invalid request methods (e.g., GET instead of POST)
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
