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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const querySnapshot = await getDocs(collection(db, "attendance"));
        const attendanceRecords = [];
    
        const today = new Date();
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            let attendanceDate;
            let hiddenCode = "Hidden";

            if (data.date && data.date.includes('/')) {
                const dateParts = data.date.split('/');
                if (dateParts.length === 3) {
                    const mmddDate = new Date(`${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`);
                    if (!isNaN(mmddDate) && mmddDate.toLocaleDateString() === today.toLocaleDateString()) {
                        attendanceDate = mmddDate;
                    }

                    const ddmmDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
                    if (!attendanceDate && !isNaN(ddmmDate) && ddmmDate.toLocaleDateString() === today.toLocaleDateString()) {
                        attendanceDate = ddmmDate;
                    }
                }
            }

            if (attendanceDate) {
                attendanceRecords.push({
                    name: data.name,
                    code: hiddenCode,
                    date: attendanceDate,
                    timestamp: data.timestamp.toMillis()
                });
            }
        });

        // Sort by timestamp
        attendanceRecords.sort((a, b) => a.timestamp - b.timestamp);

        res.status(200).json({ attendance: attendanceRecords });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch attendance records" });
    }
}
