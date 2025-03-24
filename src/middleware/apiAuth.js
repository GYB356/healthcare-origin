import { NextResponse } from "next/server";
import { verifyToken } from "../utils/jwt";

const ROLES = {
  ADMIN: "admin",
  PROVIDER: "provider",
  PATIENT: "patient",
};

const API_ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    users: ["GET", "POST", "PUT", "DELETE"],
    appointments: ["GET", "POST", "PUT", "DELETE"],
    providers: ["GET", "POST", "PUT", "DELETE"],
    patients: ["GET", "POST", "PUT", "DELETE"],
    settings: ["GET", "POST", "PUT", "DELETE"],
  },
  [ROLES.PROVIDER]: {
    appointments: ["GET", "POST", "PUT"],
    patients: ["GET", "POST", "PUT"],
    medicalRecords: ["GET", "POST", "PUT"],
  },
  [ROLES.PATIENT]: {
    appointments: ["GET", "POST"],
    medicalRecords: ["GET"],
    profile: ["GET", "PUT"],
  },
};

export async function apiAuthMiddleware(request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    const userRole = decoded.role;
    const path = request.nextUrl.pathname;
    const method = request.method;

    // Extract resource from path (e.g., /api/users -> users)
    const resource = path.split("/")[2];

    // Check if user has permission for the requested resource and method
    const userPermissions = API_ROLE_PERMISSIONS[userRole];
    if (!userPermissions || !userPermissions[resource]?.includes(method)) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Add user role to request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-role", userRole);
    requestHeaders.set("x-user-id", decoded.id);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: "/api/:path*",
}; 