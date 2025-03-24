import { withPagination } from "../../../utils/pagination";
import { withAuth } from "../../../middleware/auth";

// Mock data - replace with actual database queries
const notifications = [
  {
    id: 1,
    userId: "patient1",
    title: "Appointment Reminder",
    message: "Tomorrow at 10:00 AM with Dr. Smith",
    type: "appointment",
    createdAt: "2024-03-19T10:00:00Z",
    read: false
  },
  {
    id: 2,
    userId: "patient1",
    title: "New Test Results",
    message: "Your recent blood work results are available",
    type: "results",
    createdAt: "2024-03-18T15:30:00Z",
    read: false
  }
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
        const userNotifications = notifications
          .filter((notif) => notif.userId === userId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const paginatedNotifications = userNotifications.slice(start, end);
        const total = userNotifications.length;

        return res.json(paginatedNotifications, total);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withAuth(withPagination(handler)); 