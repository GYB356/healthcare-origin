import { useRouter } from "next/router";
import Link from "next/link";
import {
  HomeIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  BeakerIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/patient/dashboard", icon: HomeIcon },
  { name: "Profile", href: "/patient/profile", icon: UserIcon },
  { name: "Medical History", href: "/patient/medical-history", icon: ClipboardDocumentListIcon },
  { name: "Prescriptions", href: "/patient/prescriptions", icon: DocumentTextIcon },
  { name: "Lab Results", href: "/patient/lab-results", icon: BeakerIcon },
  { name: "Appointments", href: "/patient/appointments", icon: CalendarIcon },
  { name: "Messages", href: "/patient/messages", icon: ChatBubbleLeftRightIcon },
];

export default function PatientNav() {
  const router = useRouter();

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = router.pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`
              group flex items-center px-2 py-2 text-sm font-medium rounded-md
              ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }
            `}
          >
            <item.icon
              className={`
                mr-3 flex-shrink-0 h-6 w-6
                ${isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-500"}
              `}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
