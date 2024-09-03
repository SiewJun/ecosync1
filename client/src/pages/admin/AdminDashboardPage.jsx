import PendingApplicationsWidget from "@/_components/auth/admin/AdminPendingCompanyAppWidget";
import Sidebar from "@/_components/auth/admin/Sidebar";

const AdminDashboardPage = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-20 p-4"> {/* Adjust the margin-left and padding as needed */}
        <PendingApplicationsWidget />
      </div>
    </div>
  );
}

export default AdminDashboardPage;