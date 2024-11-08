import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const ConsumerMaintenance = () => {
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCompletedProjects = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/maintenance/consumer/completed-projects", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch completed projects");
        }

        const data = await response.json();
        setCompletedProjects(data.projects);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Failed to load data. Please try again.");
        toast({
          title: "Error",
          description: "Failed to fetch completed projects",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedProjects();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
        <Button variant="destructive" className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6 max-w-7xl">
      <Toaster />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Completed Projects
          </CardTitle>
          <CardDescription>
            View and manage maintenance for your completed projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project ID</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Completion Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>#{project.id}</TableCell>
                    <TableCell>{project.company.username}</TableCell>
                    <TableCell>{new Date(project.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Link to={`/consumer-dashboard/consumer-maintenance/${project.id}`}>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          View Records
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {completedProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No completed projects found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsumerMaintenance;