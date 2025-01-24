export default function handler(req, res) {
  // Only send necessary data, NOT the API keys
  res.status(200).json({ message: "Config fetched successfully" });
}
