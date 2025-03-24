import React from "react";
import Sidebar from "./Sidebar";
import Navigation from "./Navigation";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="layout">
      {isAuthenticated ? (
        <>
          <Navigation />
          <div className="layout-container">
            <Sidebar />
            <main className="main-content">{children}</main>
          </div>
        </>
      ) : (
        // Non-authenticated layout just renders children
        <main className="main-content-unauthenticated">{children}</main>
      )}
    </div>
  );
};

export default Layout;
