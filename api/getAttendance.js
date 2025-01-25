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

    // Check if we are requesting the attendance code or attendance records
    if (req.query.type === "attendanceCode") {
        try {
            // Fetch the attendance code from Firestore
            const codeDoc = doc(db, 'attendanceCodes', 'currentCode');
            const docSnapshot = await getDoc(codeDoc);

            if (docSnapshot.exists()) {
                const validCode = docSnapshot.data().code;
                console.log("🔥 Attendance Code retrieved.");
                return res.status(200).json({ code: validCode });
            } else {
                console.log("⚠ No attendance code found.");
                return res.status(404).json({ error: "Attendance code not found" });
            }
        } catch (error) {
            console.error("🔥 Error retrieving attendance code:", error);
            return res.status(500).json({ error: "Failed to fetch attendance code" });
        }
    }

    // Default case: Fetch today's attendance records
    try {
        console.log("🔥 Fetching today's attendance data...");

        const today = new Date();
        const todayFormatted = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

        const querySnapshot = await getDocs(collection(db, "attendance"));
        if (querySnapshot.empty) {
            console.warn("⚠ No attendance records found.");
            return res.status(200).json({ attendance: [] });
        }

        const attendanceRecords = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const recordDate = data.date || ""; // Get the date value

            // Function to normalize date into YYYY-MM-DD format
            const normalizeDate = (dateStr) => {
                const parts = dateStr.split('/');
                if (parts.length === 3) {
                    // Handle dd/mm/yyyy format (index 0 is day, index 1 is month, index 2 is year)
                    if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
                        return `${parts[2]}-${parts[1]}-${parts[0]}`; // Return in YYYY-MM-DD
                    }
                    // Handle mm/dd/yyyy format (index 0 is month, index 1 is day, index 2 is year)
                    if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
                        return `${parts[2]}-${parts[0]}-${parts[1]}`; // Return in YYYY-MM-DD
                    }
                }
                return null; // Invalid date format
            };

            // Normalize both today's date and the record's date
            const normalizedRecordDate = normalizeDate(recordDate);

            // If the normalized date matches today's date, add it to the list
            if (normalizedRecordDate === todayFormatted) {
                attendanceRecords.push({
                    name: data.name || "Unknown",
                    code: "Hidden", // Keep the code hidden for security
                    date: data.date || new Date().toISOString(),
                    timestamp: data.timestamp ? data.timestamp.toMillis() : 0
                });
            }
        });

        console.log("✅ Successfully fetched today's attendance data.");
        res.status(200).json({ attendance: attendanceRecords });

    } catch (error) {
        console.error("🔥 API ERROR:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
