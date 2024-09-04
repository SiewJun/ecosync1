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
import { Link, useNavigate } from "react-router-dom";

const PendingApplicationsWidget = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook to handle navigation

  useEffect(() => {
    const fetchPendingApplications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/auth/pending-applications",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the authorization header
            },
          }
        );
        const applications = response.data.applications || [];
        setPendingCount(applications.length);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          // Token expired or invalid, redirect to sign-in page
          navigate("/signin");
        } else {
          console.error("Error fetching pending applications:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPendingApplications();
  }, [navigate]);

  return (
    <>
      <Link to="/admindashboard/pendingapp">
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
      </Link>
    </>
  );
};

export default PendingApplicationsWidget;
