import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to get today's date in yyyy-mm-dd format
const getFormattedDate = (date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const yyyy = date.getFullYear();
    return `${yyyy}-${mm}-${dd}`; // Return in yyyy-mm-dd format
};

// Helper function to parse date from dd/mm/yyyy or mm/dd/yyyy
const parseDate = (dateString) => {
    const dateParts = dateString.split('/');
    let day, month, year;

    if (dateParts.length === 3) {
        if (dateParts[0].length === 2) {
            // Assume dd/mm/yyyy format
            day = parseInt(dateParts[0]);
            month = parseInt(dateParts[1]) - 1; // Month is 0-indexed in JS
            year = parseInt(dateParts[2]);
        } else {
            // Assume mm/dd/yyyy format
            month = parseInt(dateParts[0]) - 1;
            day = parseInt(dateParts[1]);
            year = parseInt(dateParts[2]);
        }
        const date = new Date(year, month, day);
        return getFormattedDate(date);
    } else {
        return null; // Invalid date format
    }
};

// API handler
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
                console.log("⚠️ No attendance code found.");
                return res.status(404).json({ error: "Attendance code not found" });
            }
        } catch (error) {
            console.error("🔥 Error retrieving attendance code:", error);
            return res.status(500).json({ error: "Failed to fetch attendance code" });
        }
    }

    // Default case: Fetch attendance records for today
    try {
        console.log("🔥 Fetching attendance data...");

        const querySnapshot = await getDocs(collection(db, "attendance"));
        if (querySnapshot.empty) {
            console.warn("⚠️ No attendance records found.");
            return res.status(200).json({ attendance: [] });
        }

        const attendanceRecords = [];
        const todayDate = getFormattedDate(new Date()); // Today's date in yyyy-mm-dd format

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const attendanceDate = parseDate(data.date); // Parse the date from Firestore
            if (attendanceDate === todayDate) {
                attendanceRecords.push({
                    name: data.name || "Unknown",
                    code: "Hidden", // Keep the code hidden for security
                    date: data.date || new Date().toISOString(),
                    timestamp: data.timestamp ? data.timestamp.toMillis() : 0
                });
            }
        });

        console.log("✅ Successfully fetched attendance data.");
        res.status(200).json({ attendance: attendanceRecords });

    } catch (error) {
        console.error("🔥 API ERROR:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}
