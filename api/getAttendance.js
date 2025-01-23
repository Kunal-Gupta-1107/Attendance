export default async function handler(req, res) {
    const apiKey = process.env.API_KEY;  // Securely get the API key

    try {
        const response = await fetch(`https://your-api.com/data`, {
            headers: { Authorization: `Bearer ${apiKey}` }
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch attendance data" });
    }
}
