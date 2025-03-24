import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PatientLayout from "@/components/layouts/PatientLayout";
import Messages from "@/components/patient/Messages";

export default function PatientMessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </PatientLayout>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <PatientLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
          <div className="mt-6">
            <Messages />
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
