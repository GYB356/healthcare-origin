const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      isActive: true,
    },
  });

  // Create doctor user
  const doctorPassword = await bcrypt.hash('doctor123', 12);
  const doctor = await prisma.user.create({
    data: {
      email: 'doctor@example.com',
      password: doctorPassword,
      name: 'Dr. John Doe',
      role: 'DOCTOR',
      department: 'Cardiology',
      specialty: 'Cardiologist',
      licenseNumber: 'MD123456',
      isActive: true,
    },
  });

  // Create patient user
  const patientPassword = await bcrypt.hash('patient123', 12);
  const patient = await prisma.user.create({
    data: {
      email: 'patient@example.com',
      password: patientPassword,
      name: 'Jane Smith',
      role: 'PATIENT',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'Female',
      phone: '123-456-7890',
      address: '123 Main St',
      emergencyContact: 'John Smith (123-456-7891)',
      bloodType: 'A+',
      isActive: true,
    },
  });

  console.log('Seed data created:', { admin, doctor, patient });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 