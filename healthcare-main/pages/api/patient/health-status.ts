import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../middleware/auth';
import { handleApiError } from '../../../lib/error-handler';

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

interface HealthData {
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  weight: string;
  height: string;
  lastCheckup: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
}

interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
  };
}

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { method } = req;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  switch (method) {
    case "GET":
      try {
        // In a real app, you would query your database here
        const userHealth = healthData[userId as keyof typeof healthData];
        
        if (!userHealth) {
          return res.status(404).json({ error: "Health data not found" });
        }

        return res.json(userHealth);
      } catch (error) {
        return handleApiError(error, res);
      }

    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
};

// Removed withCache as it might be causing issues
export default withAuth(handler); 