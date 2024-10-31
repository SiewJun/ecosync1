import { useEffect, useState } from "react";
import PendingApplicationsWidget from "@/_components/admin/AdminPendingCompanyAppWidget";
import axios from "axios";
import { Loader2 } from "lucide-react";

const AdminHomeDashboardPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUser(response.data.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>;
  }

  return (
    <>
      <div className="container p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-inter">
            {user?.role === "SUPERADMIN"
              ? "Superadmin Dashboard"
              : "Admin Dashboard"}
          </h1>
          <p className="mt-2 text-gray-500">
            Welcome, {user?.username}. Manage and track your organization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PendingApplicationsWidget />
          {/* Add more widgets here */}
        </div>
      </div>
    </>
  );
};

export default AdminHomeDashboardPage;
