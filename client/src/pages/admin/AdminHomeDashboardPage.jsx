import PendingApplicationsWidget from "@/_components/admin/AdminPendingCompanyAppWidget";

const AdminHomeDashboardPage = () => {
  return (
    <>
      <div className="container p-6 space-y-8">
        <h1 className="text-2xl font-bold mb-4 font-inter">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PendingApplicationsWidget />
          {/* Add more widgets here */}
        </div>
      </div>
    </>
  );
};

export default AdminHomeDashboardPage;
