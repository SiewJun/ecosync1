import { Routes, Route } from "react-router-dom";
import Sidebar from "@/_components/admin/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminPendingCompanyAppDashboardPage from "./AdminPendingCompanyAppDashboardPage";
import AdminModerationIncentives from "@/_components/admin/AdminModerationIncentives";
import NotFoundPage from "@/pages/NotFoundPage";
import ProtectedRoute from "@/ProtectedRoute";
import SuperAdminUsersManagement from "@/pages/admin/SuperAdminUsersManagement";
import AdminNotification from "@/_components/admin/AdminNotification";

const AdminDashboardPage = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <Routes>
            <Route
              path="pendingapp"
              element={
                <ProtectedRoute element={<AdminPendingCompanyAppDashboardPage />} roles={["ADMIN", "SUPERADMIN"]} />
              }
            />
            <Route
              path="incentives"
              element={
                <ProtectedRoute element={<AdminModerationIncentives />} roles={["ADMIN", "SUPERADMIN"]} />
              }
            />
            <Route
              path="notification"
              element={
                <ProtectedRoute element={<AdminNotification />} roles={["ADMIN", "SUPERADMIN"]} />
              }
            />
            <Route
              path="users-management"
              element={
                <ProtectedRoute element={<SuperAdminUsersManagement />} roles={["SUPERADMIN"]} />
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ScrollArea>
      </main>
    </div>
  );
};

export default AdminDashboardPage;