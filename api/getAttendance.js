import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";

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

// Helper function to get today's date in yyyy-mm-dd format
const getFormattedDate = (date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const yyyy = date.getFullYear();
    return `${yyyy}-${mm}-${dd}`; // Return in yyyy-mm-dd format
};

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

        const todayDate = getFormattedDate(new Date()); // Today's date in yyyy-mm-dd format

        // Query Firestore for records where the date matches today's date
        const querySnapshot = await getDocs(query(
            collection(db, "attendance"),
            where("date", "==", todayDate) // Filter records by today's date
        ));

        if (querySnapshot.empty) {
            console.warn("⚠ No attendance records for today.");
            return res.status(200).json({ attendance: [] });
        }

        const attendanceRecords = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            attendanceRecords.push({
                name: data.name || "Unknown",
                code: "Hidden", // Keep the code hidden for security
                date: data.date || new Date().toISOString(),
                timestamp: data.timestamp ? data.timestamp.toMillis() : 0
            });
        });

        console.log("✅ Successfully fetched today's attendance data.");
        res.status(200).json({ attendance: attendanceRecords });

    } catch (error) {
        console.error("🔥 API ERROR:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
