import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import DashboardRouter from '../../components/dashboard/DashboardRouter';
import ProtectedRoute from '../../components/ProtectedRoute';

const Dashboard: NextPage = () => {
  const { data: session } = useSession();

  return (
    <ProtectedRoute>
      <Layout>
        <Head>
          <title>Dashboard | HealthcareSync</title>
          <meta name="description" content="HealthcareSync dashboard" />
        </Head>
        <div className="min-h-screen bg-gray-50">
          <DashboardRouter />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Dashboard; 