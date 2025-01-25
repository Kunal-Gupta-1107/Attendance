export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const querySnapshot = await getDocs(collection(db, "attendance"));
        const attendanceRecords = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            attendanceRecords.push({
                name: data.name || "Unknown",
                code: "Hidden",
                date: data.date || new Date().toISOString(),
                timestamp: data.timestamp ? data.timestamp.toMillis() : 0
            });
        });

        res.status(200).json({ attendance: attendanceRecords });
    } catch (error) {
        console.error("🔥 API ERROR:", error);
        res.status(500).json({ error: "Failed to fetch attendance records", details: error.message });
    }
}
