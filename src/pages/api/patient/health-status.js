import { withCache } from "../../../utils/cache";
import { withAuth } from "../../../middleware/auth";

// Mock data - replace with actual database queries
const healthData = {
  "patient1": {
    bloodPressure: "120/80",
    heartRate: "72 bpm",
    temperature: "98.6°F",
    weight: "150 lbs",
    height: "5'10\"",
    lastCheckup: "2024-03-01T10:00:00Z",
    medications: [
      { name: "Medication A", dosage: "10mg", frequency: "daily" },
      { name: "Medication B", dosage: "5mg", frequency: "twice daily" }
    ]
  }
};

const handler = async (req, res) => {
  const { method } = req;
  const userId = req.user.id;

  switch (method) {
    case "GET":
      try {
        // In a real app, you would query your database here
        const userHealth = healthData[userId];
        
        if (!userHealth) {
          return res.status(404).json({ error: "Health data not found" });
        }

        return res.json(userHealth);
      } catch (error) {
        console.error("Error fetching health status:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withAuth(withCache(handler)); 