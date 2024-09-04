import PendingApplicationsWidget from "@/_components/admin/AdminPendingCompanyAppWidget";
import Sidebar from "@/_components/admin/Sidebar";

const AdminDashboardPage = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-20 p-4">
        <h1 className="text-2xl font-bold mb-4 font-inter">Admin Dashboard</h1>
        <PendingApplicationsWidget />
      </div>
    </div>
  );
}

export default AdminDashboardPage;