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
    <Link to="pendingapp">
      <Card className="md:max-w-sm shadow-lg rounded-lg overflow-hidden border mt-10 bg-gradient-to-r from-[hsl(156,56%,73%)] via-[hsl(156,56%,63%)] to-[hsl(156,56%,53%)] transform transition-transform hover:scale-105">
        <CardHeader className="p-6">
          <CardTitle className="text-2xl font-bold font-openSans text-white">
            Pending Company Applications
          </CardTitle>
          <CardDescription className="text-md font-light font-poppins text-white">
            Review pending company applications
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 flex items-center justify-center">
          {loading ? (
            <Loader className="animate-spin w-8 h-8 text-white" />
          ) : (
            <p className="text-5xl font-extrabold text-white">{pendingCount}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default PendingApplicationsWidget;