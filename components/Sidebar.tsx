import React from "react";
import { useAuth } from "@/contexts/AuthContext";

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  // Define sidebar links based on user role
  const getSidebarLinks = () => {
    const commonLinks = [
      { name: "Dashboard", href: "/dashboard", icon: "📊" },
      { name: "Profile", href: "/profile", icon: "👤" },
    ];

    const roleBasedLinks: Record<string, { name: string; href: string; icon: string }[]> = {
      admin: [
        { name: "Users", href: "/admin/users", icon: "👥" },
        { name: "Settings", href: "/admin/settings", icon: "⚙️" },
        { name: "Reports", href: "/admin/reports", icon: "📈" },
      ],
      doctor: [
        { name: "Patients", href: "/doctor/patients", icon: "🏥" },
        { name: "Appointments", href: "/doctor/appointments", icon: "📅" },
        { name: "Prescriptions", href: "/doctor/prescriptions", icon: "💊" },
      ],
      patient: [
        { name: "Appointments", href: "/patient/appointments", icon: "📅" },
        { name: "Medical Records", href: "/patient/records", icon: "📋" },
        { name: "Messages", href: "/patient/messages", icon: "✉️" },
      ],
      nurse: [
        { name: "Patients", href: "/nurse/patients", icon: "🏥" },
        { name: "Schedule", href: "/nurse/schedule", icon: "📅" },
      ],
      staff: [
        { name: "Appointments", href: "/staff/appointments", icon: "📅" },
        { name: "Billing", href: "/staff/billing", icon: "💰" },
      ],
    };

    return [
      ...commonLinks,
      ...(user?.role && roleBasedLinks[user.role] ? roleBasedLinks[user.role] : []),
    ];
  };

  const links = getSidebarLinks();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>
          {user?.role
            ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Portal`
            : "Portal"}
        </h3>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {links.map((link) => (
            <li key={link.name}>
              <a href={link.href}>
                <span className="icon">{link.icon}</span>
                <span className="link-text">{link.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
