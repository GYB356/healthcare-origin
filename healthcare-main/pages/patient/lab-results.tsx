import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import PatientLayout from "../../components/layouts/PatientLayout";
import LabResults from "../../components/patient/LabResults";

export default function PatientLabResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <PatientLayout>
      <div className="max-w-7xl mx-auto">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Lab Results</h1>
          <LabResults />
        </div>
      </div>
    </PatientLayout>
  );
}
