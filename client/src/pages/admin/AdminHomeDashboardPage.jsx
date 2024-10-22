import PendingApplicationsWidget from "@/_components/admin/AdminPendingCompanyAppWidget";

const AdminHomeDashboardPage = () => {
  return (
    <>
      <div className="container p-6">
        <h1 className="text-3xl font-bold font-inter">Admin Dashboard</h1>
        <p className="mt-2 text-gray-500">
          Manage and track your organization
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PendingApplicationsWidget />
          {/* Add more widgets here */}
        </div>
      </div>
    </>
  );
};

export default AdminHomeDashboardPage;
