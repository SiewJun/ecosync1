// AdminDashboard.jsx
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import axios from "axios";
import { Loader } from "lucide-react";

const PendingApplicationsWidget = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingApplications = async () => {
      try {
        const response = await axios.get("/pending-applications");
        const applications = response.data.applications || [];
        setPendingCount(applications.length);
      } catch (error) {
        console.error("Error fetching pending applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingApplications();
  }, []);

  return (
    <Card className="max-w-sm shadow-lg rounded-lg overflow-hidden border mt-10">
      <CardHeader className="p-4">
        <CardTitle className="text-lg font-semibold">
          Pending Company Applications
        </CardTitle>
        <CardDescription className="text-sm font-light">
          Review pending company applications
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 flex items-center justify-center">
        {loading ? (
          <Loader className="animate-spin w-6 h-6" />
        ) : (
          <p className="text-4xl font-bold">{pendingCount}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingApplicationsWidget;
