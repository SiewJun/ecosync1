import { Routes, Route } from "react-router-dom";
import Sidebar from "@/_components/admin/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminHomeDashboardPage from "./AdminHomeDashboardPage";
import AdminPendingCompanyAppDashboardPage from "./AdminPendingCompanyAppDashboardPage";
import AdminModerationIncentives from "@/_components/admin/AdminModerationIncentives";
import NotFoundPage from "@/pages/NotFoundPage";

const AdminDashboardPage = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <Routes>
            <Route index element={<AdminHomeDashboardPage />} />
            <Route
              path="pendingapp"
              element={<AdminPendingCompanyAppDashboardPage />}
            />
            <Route path="incentives" element={<AdminModerationIncentives />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ScrollArea>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
