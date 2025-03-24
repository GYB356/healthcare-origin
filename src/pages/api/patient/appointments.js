import { withCache } from "../../../utils/cache";
import { withPagination } from "../../../utils/pagination";
import { withAuth } from "../../../middleware/auth";

// Mock data - replace with actual database queries
const appointments = [
  {
    id: 1,
    providerId: "provider1",
    providerName: "Dr. Smith",
    patientId: "patient1",
    date: "2024-03-20T10:00:00Z",
    status: "scheduled",
    type: "Check-up"
  },
  // Add more mock appointments...
];

const handler = async (req, res) => {
  const { method } = req;
  const { page, pageSize } = req.pagination;
  const userId = req.user.id;

  switch (method) {
    case "GET":
      try {
        // In a real app, you would query your database here
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const userAppointments = appointments.filter(
          (apt) => apt.patientId === userId
        );
        
        const paginatedAppointments = userAppointments.slice(start, end);
        const total = userAppointments.length;

        return res.json(paginatedAppointments, total);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withAuth(withCache(withPagination(handler))); 