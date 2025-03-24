import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import DoctorSchedule from "@/components/scheduling/DoctorSchedule";
import { Toaster } from "react-hot-toast";

export default function DoctorSchedulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== "DOCTOR") {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-8">Manage Your Schedule</h1>
      <div className="bg-white rounded-lg shadow">
        <DoctorSchedule />
      </div>
    </div>
  );
}
