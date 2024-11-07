import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const MaintenanceDashboard = () => {
  const [completedProjects, setCompletedProjects] = useState([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("completed");

  // Organize maintenance schedules by project ID for quick lookup
  const maintenanceByProject = maintenanceSchedules.reduce((acc, schedule) => {
    if (!acc[schedule.projectId]) {
      acc[schedule.projectId] = [];
    }
    acc[schedule.projectId].push(schedule);
    return acc;
  }, {});

  // Check if a project has pending maintenance
  const hasActiveMaintenance = (projectId) => {
    return maintenanceByProject[projectId]?.some(
      (schedule) =>
        schedule.status === "SCHEDULED" || schedule.status === "CONFIRMED"
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, schedulesRes] = await Promise.all([
          fetch("http://localhost:5000/api/maintenance/completed-projects", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          fetch("http://localhost:5000/api/maintenance/schedules", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);

        if (!projectsRes.ok || !schedulesRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const projectsData = await projectsRes.json();
        const schedulesData = await schedulesRes.json();

        setCompletedProjects(projectsData.projects);
        setMaintenanceSchedules(schedulesData.schedules);
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMarkAsComplete = async (scheduleId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/maintenance/${scheduleId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "COMPLETED" }),
        }
      );

      if (!res.ok) throw new Error("Failed to mark as complete");

      const updatedSchedules = await fetch(
        "http://localhost:5000/api/maintenance/schedules",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      ).then((res) => res.json());

      setMaintenanceSchedules(updatedSchedules.schedules);
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Failed to mark as complete. Please try again.");
    }
  };

  const ScheduleMaintenanceForm = ({ project, onClose }) => {
    const [scheduledDate, setScheduledDate] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [validationError, setValidationError] = useState("");

    const handleSubmit = async (e) => {
      e.preventDefault();
      setValidationError("");

      // Validate date is in the future
      if (new Date(scheduledDate) <= new Date()) {
        setValidationError("Please select a future date and time");
        return;
      }

      setSubmitting(true);

      try {
        const res = await fetch(
          `http://localhost:5000/api/maintenance/${project.id}/schedule`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ scheduledDate, notes }),
          }
        );

        if (!res.ok) throw new Error("Failed to schedule maintenance");

        const updatedSchedules = await fetch(
          "http://localhost:5000/api/maintenance/schedules",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ).then((res) => res.json());

        setMaintenanceSchedules(updatedSchedules.schedules);
        onClose();
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setValidationError("Failed to schedule maintenance. Please try again.");
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {validationError && (
          <Alert variant="destructive">
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Schedule Date and Time</label>
          <input
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent bg-secondary text-foreground"
            required
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Maintenance Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border rounded h-32 focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-background"
            placeholder="Add maintenance details, special instructions, or required equipment..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="w-24"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Scheduling..." : "Schedule"}
          </Button>
        </div>
      </form>
    );
  };

  ScheduleMaintenanceForm.propTypes = {
    project: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
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
        <Button
          variant="destructive"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  const renderMaintenanceStatus = (status) => {
    const statusStyles = {
      SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200",
      COMPLETED: "bg-green-50 text-green-700 border-green-200",
      IN_PROGRESS: "bg-yellow-50 text-yellow-700 border-yellow-200",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[status]}`}
      >
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6 max-w-7xl">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6  justify-end">
        <div className="flex space-x-2 p-1 rounded-lg border">
          <Button
            variant={activeTab === "completed" ? "default" : "ghost"}
            className={`${
              activeTab === "completed" ? "bg-primary shadow-sm" : ""
            }`}
            onClick={() => setActiveTab("completed")}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Projects
          </Button>
          <Button
            variant={activeTab === "upcoming" ? "default" : "ghost"}
            className={`${
              activeTab === "upcoming" ? "bg-primary shadow-sm" : ""
            }`}
            onClick={() => setActiveTab("upcoming")}
          >
            <Clock className="w-4 h-4 mr-2" />
            Upcoming
          </Button>
        </div>
      </div>

      {activeTab === "upcoming" ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock className="w-5 h-5 text-blue-600" />
              Upcoming Maintenance
            </CardTitle>
            <CardDescription>
              View and manage scheduled maintenance appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Details</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceSchedules
                    .filter((schedule) => schedule.status !== "COMPLETED")
                    .sort(
                      (a, b) =>
                        new Date(a.scheduledDate) - new Date(b.scheduledDate)
                    )
                    .map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="text-blue-600">
                              #{schedule.projectId}
                            </span>
                            <span className="text-sm text-gray-500">
                              Solar Installation
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{schedule.project?.consumer.username}</span>
                            <span className="text-sm text-gray-500">
                              {schedule.project?.consumer.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>
                              {new Date(
                                schedule.scheduledDate
                              ).toLocaleDateString()}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(
                                schedule.scheduledDate
                              ).toLocaleTimeString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {renderMaintenanceStatus(schedule.status)}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate text-sm text-gray-600">
                              {schedule.notes || "No notes provided"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            className="flex items-center gap-2 hover:bg-green-50 hover:text-green-600"
                            onClick={() => handleMarkAsComplete(schedule.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark as Complete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {maintenanceSchedules.filter((s) => s.status !== "COMPLETED")
                .length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No upcoming maintenance scheduled
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Completed Projects
            </CardTitle>
            <CardDescription>
              View and schedule maintenance for completed solar installations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Completion Date</TableHead>
                    <TableHead>Last Maintenance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedProjects.map((project) => {
                    const hasPendingMaintenance = hasActiveMaintenance(
                      project.id
                    );
                    const lastMaintenance = maintenanceByProject[
                      project.id
                    ]?.sort(
                      (a, b) =>
                        new Date(b.scheduledDate) - new Date(a.scheduledDate)
                    )[0];

                    return (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="text-blue-600">#{project.id}</span>
                            <span className="text-sm text-gray-500">
                              Solar Installation
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{project.consumer.username}</span>
                            <span className="text-sm text-gray-500">
                              {project.consumer.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(project.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {lastMaintenance ? (
                            <div className="flex flex-col">
                              <span>
                                {new Date(
                                  lastMaintenance.scheduledDate
                                ).toLocaleDateString()}
                              </span>
                              <span className="text-sm text-gray-500">
                                {renderMaintenanceStatus(
                                  lastMaintenance.status
                                )}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500">
                              No maintenance yet
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {!hasPendingMaintenance ? (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="flex items-center gap-2"
                                  onClick={() => setSelectedProject(project)}
                                >
                                  <Calendar className="w-4 h-4" />
                                  Schedule
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    Schedule Maintenance
                                  </DialogTitle>
                                  <div className="mt-2 space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="font-medium">
                                        Project:
                                      </span>
                                      <span>#{project.id}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="font-medium">
                                        Customer:
                                      </span>
                                      <span>{project.consumer.username}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="font-medium">
                                        Completed:
                                      </span>
                                      <span>
                                        {new Date(
                                          project.endDate
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </DialogHeader>
                                <ScheduleMaintenanceForm
                                  project={project}
                                  onClose={() => setSelectedProject(null)}
                                />
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <AlertCircle className="w-4 h-4" />
                              Maintenance Pending
                            </div>
                          )}
                          <Link to={`${project.id}`}>
                            <Button
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <Calendar className="w-4 h-4" />
                              View Records
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
      )}
    </div>
  );
};

export default MaintenanceDashboard;
