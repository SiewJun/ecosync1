import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ArrowLeft, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ConsumerMaintenanceRecords = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ proposedDates: [], reason: "" });

  useEffect(() => {
    const fetchMaintenanceRecords = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/maintenance/project/${projectId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch maintenance records");
        }

        const data = await response.json();
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

  const handleConfirmMaintenance = async (maintenanceId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/maintenance/${maintenanceId}/confirm`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to confirm maintenance");
      }

      // Refresh the maintenance records list
      const updatedRecords = await fetch(`http://localhost:5000/api/maintenance/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then((res) => res.json());

      setMaintenanceRecords(updatedRecords.maintenanceRecords);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Failed to confirm maintenance. Please try again.");
    }
  };

  const handleRescheduleMaintenance = async (maintenanceId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/maintenance/${maintenanceId}/consumer-reschedule`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rescheduleForm),
      });

      if (!response.ok) {
        throw new Error("Failed to reschedule maintenance");
      }

      // Refresh the maintenance records list
      const updatedRecords = await fetch(`http://localhost:5000/api/maintenance/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then((res) => res.json());

      setMaintenanceRecords(updatedRecords.maintenanceRecords);
      setSelectedMaintenance(null);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Failed to reschedule maintenance. Please try again.");
    }
  };

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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.scheduledDate).toLocaleString()}</TableCell>
                    <TableCell>{record.status}</TableCell>
                    <TableCell>{record.notes || "No notes provided"}</TableCell>
                    <TableCell>
                      {record.status === "SCHEDULED" && (
                        <>
                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => handleConfirmMaintenance(record.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Confirm
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Reschedule
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Calendar className="w-5 h-5 text-blue-600" />
                                  Reschedule Maintenance
                                </DialogTitle>
                              </DialogHeader>
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleRescheduleMaintenance(record.id);
                                }}
                                className="space-y-6"
                              >
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Proposed Dates</label>
                                  <input
                                    type="datetime-local"
                                    value={rescheduleForm.proposedDates[0] || ""}
                                    onChange={(e) =>
                                      setRescheduleForm((prev) => ({
                                        ...prev,
                                        proposedDates: [e.target.value],
                                      }))
                                    }
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent bg-secondary text-foreground"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Reason</label>
                                  <textarea
                                    value={rescheduleForm.reason}
                                    onChange={(e) =>
                                      setRescheduleForm((prev) => ({
                                        ...prev,
                                        reason: e.target.value,
                                      }))
                                    }
                                    className="w-full p-2 border rounded h-32 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-background"
                                    placeholder="Add reason for rescheduling..."
                                  />
                                </div>
                                <div className="flex justify-end space-x-3">
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedMaintenance(null)}
                                    className="w-24"
                                  >
                                    Cancel
                                  </Button>
                                  <Button type="submit">
                                    Reschedule
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </TableCell>
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

export default ConsumerMaintenanceRecords;