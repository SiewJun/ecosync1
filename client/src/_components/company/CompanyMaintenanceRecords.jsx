import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ArrowLeft} from "lucide-react";
import { Button } from "@/components/ui/button";

const ProjectMaintenanceRecords = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaintenanceRecords = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/maintenance/project/${projectId}`, {
          credentials: "include", // Include credentials in the request
        });
  
        if (!res.ok) {
          throw new Error("Failed to fetch maintenance records");
        }
  
        const data = await res.json();
        setMaintenanceRecords(data.maintenanceRecords);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Failed to load maintenance records. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchMaintenanceRecords();
  }, [projectId]);

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
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft />
      </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            Maintenance Records for Project #{projectId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.scheduledDate).toLocaleString()}</TableCell>
                    <TableCell>{record.status}</TableCell>
                    <TableCell>{record.notes || "No notes provided"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {maintenanceRecords.length === 0 && (
              <div className="text-center py-8 text-gray-500">No maintenance records found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectMaintenanceRecords;