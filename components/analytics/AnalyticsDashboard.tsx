import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "react-hot-toast";

interface AnalyticsData {
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    upcoming: number;
    byMonth: Array<{
      month: string;
      count: number;
    }>;
    byStatus: Array<{
      status: string;
      count: number;
    }>;
  };
  revenue: {
    total: number;
    pending: number;
    received: number;
    byMonth: Array<{
      month: string;
      amount: number;
    }>;
  };
  patients: {
    total: number;
    new: number;
    byDepartment: Array<{
      department: string;
      count: number;
    }>;
  };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month"); // month, quarter, year

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      toast.error("Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  if (loading || !data) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Appointments Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">{data.appointments.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{data.appointments.completed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{data.appointments.cancelled}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-blue-600">{data.appointments.upcoming}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Revenue Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">${data.revenue.total.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                ${data.revenue.pending.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Received</p>
              <p className="text-2xl font-bold text-green-600">
                ${data.revenue.received.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Patient Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold">{data.patients.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">New Patients</p>
              <p className="text-2xl font-bold text-blue-600">{data.patients.new}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Appointments Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.appointments.byMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Revenue Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenue.byMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#4C51BF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Appointments by Status</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.appointments.byStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {data.appointments.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Patients by Department</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.patients.byDepartment}
                  dataKey="count"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {data.patients.byDepartment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
