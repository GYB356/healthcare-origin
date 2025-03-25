import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { timeRange = "month" } = req.query;
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case "quarter":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }

    // Fetch appointments data
    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startDate,
        },
      },
      include: {
        patient: true,
      },
    });

    // Fetch invoices data
    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Fetch patients data
    const patients = await prisma.user.findMany({
      where: {
        role: "PATIENT",
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        patientAppointments: true,
      },
    });

    // Process appointments data
    const appointmentsData = {
      total: appointments.length,
      completed: appointments.filter((a) => a.status === "COMPLETED").length,
      cancelled: appointments.filter((a) => a.status === "CANCELLED").length,
      upcoming: appointments.filter((a) => new Date(a.date) > now).length,
      byMonth: getMonthlyData(appointments, "date"),
      byStatus: getStatusData(appointments),
    };

    // Process revenue data
    const revenueData = {
      total: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
      pending: invoices
        .filter((inv) => inv.status === "PENDING")
        .reduce((sum, inv) => sum + inv.totalAmount, 0),
      received: invoices
        .filter((inv) => inv.status === "PAID")
        .reduce((sum, inv) => sum + inv.totalAmount, 0),
      byMonth: getMonthlyRevenueData(invoices),
    };

    // Process patients data
    const patientsData = {
      total: patients.length,
      new: patients.filter((p) => new Date(p.createdAt) >= startDate).length,
      byDepartment: await getDepartmentData(),
    };

    return res.status(200).json({
      appointments: appointmentsData,
      revenue: revenueData,
      patients: patientsData,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return res.status(500).json({ error: "Failed to fetch analytics data" });
  }
}

function getMonthlyData(data: any[], dateField: string) {
  const monthlyData = new Map();

  data.forEach((item) => {
    const date = new Date(item[dateField]);
    const monthYear = date.toLocaleString("default", { month: "short", year: "numeric" });

    monthlyData.set(monthYear, (monthlyData.get(monthYear) || 0) + 1);
  });

  return Array.from(monthlyData, ([month, count]) => ({ month, count }));
}

function getMonthlyRevenueData(invoices: any[]) {
  const monthlyData = new Map();

  invoices.forEach((invoice) => {
    const date = new Date(invoice.createdAt);
    const monthYear = date.toLocaleString("default", { month: "short", year: "numeric" });

    monthlyData.set(monthYear, (monthlyData.get(monthYear) || 0) + invoice.totalAmount);
  });

  return Array.from(monthlyData, ([month, amount]) => ({ month, amount }));
}

function getStatusData(appointments: any[]) {
  const statusData = new Map();

  appointments.forEach((appointment) => {
    statusData.set(appointment.status, (statusData.get(appointment.status) || 0) + 1);
  });

  return Array.from(statusData, ([status, count]) => ({ status, count }));
}

async function getDepartmentData() {
  const doctors = await prisma.user.findMany({
    where: {
      role: "DOCTOR",
    },
    select: {
      department: true,
      _count: {
        select: {
          doctorAppointments: true,
        },
      },
    },
  });

  const departmentData = new Map();

  doctors.forEach((doctor) => {
    if (doctor.department) {
      departmentData.set(
        doctor.department,
        (departmentData.get(doctor.department) || 0) + doctor._count.doctorAppointments,
      );
    }
  });

  return Array.from(departmentData, ([department, count]) => ({ department, count }));
}
