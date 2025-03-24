import React from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const ROLES = {
  ADMIN: "admin",
  PROVIDER: "provider",
  PATIENT: "patient",
};

const withAuth = (WrappedComponent, allowedRoles) => {
  return function WithAuthComponent(props) {
    const router = useRouter();
    const { data: session, status } = useSession();

    React.useEffect(() => {
      if (status === "unauthenticated") {
        router.push("/login");
      } else if (status === "authenticated" && !allowedRoles.includes(session.user.role)) {
        // Redirect to appropriate dashboard based on role
        router.push(`/${session.user.role}`);
      }
    }, [status, session, router]);

    if (status === "loading") {
      return <div>Loading...</div>;
    }

    if (status === "authenticated" && allowedRoles.includes(session.user.role)) {
      return <WrappedComponent {...props} />;
    }

    return null;
  };
};

export { withAuth, ROLES }; 