import { CalendarIcon } from '@heroicons/react/24/outline';

const navigation = [
  {
    name: 'Appointments',
    href: '/appointments',
    icon: CalendarIcon,
    allowedRoles: [UserRole.ADMIN, UserRole.STAFF, UserRole.DOCTOR, UserRole.PATIENT],
  },
]; 