import { getSession } from "next-auth/react";
import { verify } from "jsonwebtoken";

export const withAuth = (handler) => {
  return async (req, res) => {
    try {
      // Check for Next-Auth session
      const session = await getSession({ req });
      
      if (session?.user) {
        req.user = session.user;
        return handler(req, res);
      }
      
      // Fallback to JWT token in Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const token = authHeader.substring(7);
      
      try {
        const decoded = verify(token, process.env.JWT_SECRET || "your-secret-key");
        req.user = decoded;
        return handler(req, res);
      } catch (tokenError) {
        console.error("Token verification error:", tokenError);
        return res.status(401).json({ error: "Invalid token" });
    }
  } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}; 