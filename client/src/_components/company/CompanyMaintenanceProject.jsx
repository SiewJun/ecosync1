import { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle2, XCircle } from "lucide-react";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useNavigate } from "react-router-dom";

const CompanyMaintenanceProject = () => {
  const [activeTab, setActiveTab] = useState("completed");
  const [completedProjects, setCompletedProjects] = useState([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isSchedulingOpen, setIsSchedulingOpen] = useState(false);
  const [schedulingForm, setSchedulingForm] = useState({
    scheduledDate: "",
    notes: "",
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPageCompleted, setCurrentPageCompleted] = useState(1);
  const [currentPageMaintenance, setCurrentPageMaintenance] = useState(1);
  const itemsPerPage = 10;

  const filteredCompletedProjects = completedProjects.filter((project) =>
    project.consumer.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMaintenanceSchedules = maintenanceSchedules.filter((schedule) =>
    schedule.project.consumer.username
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const paginatedCompletedProjects = filteredCompletedProjects.slice(
    (currentPageCompleted - 1) * itemsPerPage,
    currentPageCompleted * itemsPerPage
  );

  const paginatedMaintenanceSchedules = filteredMaintenanceSchedules.slice(
    (currentPageMaintenance - 1) * itemsPerPage,
    currentPageMaintenance * itemsPerPage
  );

  useEffect(() => {
    fetchCompletedProjects();
    fetchMaintenanceSchedules();
  }, []);

  const fetchCompletedProjects = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/maintenance/completed-projects",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include", // Include credentials in the request
        }
      );
      const data = await response.json();
      setCompletedProjects(data.projects);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch completed projects",
        variant: "destructive",
      });
    }
  };

  const fetchMaintenanceSchedules = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/maintenance/schedules",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include", // Include credentials in the request
        }
      );
      const data = await response.json();
      setMaintenanceSchedules(data.schedules);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch maintenance schedules",
        variant: "destructive",
      });
    }
  };

  const handleScheduleMaintenance = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:5000/api/maintenance/${selectedProject.id}/schedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(schedulingForm),
          credentials: "include", // Include credentials in the request
        }
      );
  
      if (response.ok) {
        toast({
          title: "Success",
          description: "Maintenance scheduled successfully",
        });
        setIsSchedulingOpen(false);
        fetchMaintenanceSchedules();
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule maintenance",
        variant: "destructive",
      });
    }
  };

  const handleConfirmMaintenance = async (maintenanceId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/maintenance/${maintenanceId}/company-confirm`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include", // Include credentials in the request
        }
      );
  
      if (response.ok) {
        toast({
          title: "Success",
          description: "Maintenance confirmed successfully",
        });
        fetchMaintenanceSchedules();
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm maintenance",
        variant: "destructive",
      });
    }
  };

  const handleRejectMaintenance = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/maintenance/${selectedMaintenance.id}/company-reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ reason: rejectionReason }),
          credentials: "include", // Include credentials in the request
        }
      );
  
      if (response.ok) {
        toast({
          title: "Success",
          description: "Maintenance rejected successfully",
        });
        setIsRejectDialogOpen(false);
        fetchMaintenanceSchedules();
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject maintenance",
        variant: "destructive",
      });
    }
  };

  const handleMaintenanceComplete = async (maintenanceId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/maintenance/${maintenanceId}/complete`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include", // Include credentials in the request
        }
      );
  
      if (response.ok) {
        toast({
          title: "Success",
          description: "Maintenance marked as completed successfully",
        });
        fetchMaintenanceSchedules();
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark maintenance as completed",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      SCHEDULED: "bg-blue-500",
      CONFIRMED: "bg-green-500",
      COMPLETED: "bg-purple-500",
      REJECTED: "bg-red-500",
      RESCHEDULE_PENDING: "bg-yellow-500",
    };

    return (
      <Badge className={`${statusColors[status]} text-white`}>{status}</Badge>
    );
  };

  return (
    <div className="min-h-screen container p-6">
      <div className="max-w-5xl mx-auto">
        <Toaster />
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="completed">Completed Projects</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed Projects</CardTitle>

                <CardDescription>
                  View and schedule maintenance for completed projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  type="text"
                  placeholder="Search by customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-4"
                />
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCompletedProjects.map((project) => {
                        const hasIncompleteMaintenance =
                          project.maintenance.some(
                            (maintenance) => maintenance.status !== "COMPLETED"
                          );
                        return (
                          <TableRow key={project.id}>
                            <TableCell>{project.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span>{project.consumer.username}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{project.consumer.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {project.status === "COMPLETED" &&
                                  !hasIncompleteMaintenance && (
                                    <Button
                                      onClick={() => {
                                        setSelectedProject(project);
                                        setIsSchedulingOpen(true);
                                      }}
                                      size="sm"
                                    >
                                      Schedule
                                    </Button>
                                  )}
                                <Button
                                  onClick={() =>
                                    navigate(
                                      `/company-dashboard/company-maintenance/${project.id}`
                                    )
                                  }
                                  size="sm"
                                  variant="outline"
                                >
                                  View Records
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <div className="flex justify-between items-center mt-4">
                    <Button
                      onClick={() =>
                        setCurrentPageCompleted(currentPageCompleted - 1)
                      }
                      disabled={currentPageCompleted === 1}
                    >
                      Previous
                    </Button>
                    <span>
                      Page {currentPageCompleted} of{" "}
                      {Math.ceil(
                        filteredCompletedProjects.length / itemsPerPage
                      )}
                    </span>
                    <Button
                      onClick={() =>
                        setCurrentPageCompleted(currentPageCompleted + 1)
                      }
                      disabled={
                        currentPageCompleted ===
                        Math.ceil(
                          filteredCompletedProjects.length / itemsPerPage
                        )
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>

                <CardDescription>
                  View and manage upcoming maintenance appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  type="text"
                  placeholder="Search by customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-4"
                />
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project ID</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedMaintenanceSchedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell>{schedule.project.id}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(
                                    schedule.scheduledDate
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {new Date(
                                    schedule.scheduledDate
                                  ).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div>
                                <div>{schedule.project.consumer.username}</div>
                                <div className="text-sm text-gray-500">
                                  {schedule.project.consumer.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(schedule.status)}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {schedule.notes || "No notes"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {schedule.status === "RESCHEDULE_PENDING" && (
                                <>
                                  <Button
                                    onClick={() =>
                                      handleConfirmMaintenance(schedule.id)
                                    }
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center space-x-1 text-green-500 hover:text-green-600"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Confirm</span>
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setSelectedMaintenance(schedule);
                                      setIsRejectDialogOpen(true);
                                    }}
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center space-x-1 text-red-500 hover:text-red-600"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    <span>Reject</span>
                                  </Button>
                                </>
                              )}
                              {schedule.status === "CONFIRMED" && (
                                <Button
                                  onClick={() =>
                                    handleMaintenanceComplete(schedule.id)
                                  }
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center space-x-1"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Mark as Completed</span>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-between items-center mt-4">
                    <Button
                      onClick={() =>
                        setCurrentPageMaintenance(currentPageMaintenance - 1)
                      }
                      disabled={currentPageMaintenance === 1}
                    >
                      Previous
                    </Button>
                    <span>
                      Page {currentPageMaintenance} of{" "}
                      {Math.ceil(
                        filteredMaintenanceSchedules.length / itemsPerPage
                      )}
                    </span>
                    <Button
                      onClick={() =>
                        setCurrentPageMaintenance(currentPageMaintenance + 1)
                      }
                      disabled={
                        currentPageMaintenance ===
                        Math.ceil(
                          filteredMaintenanceSchedules.length / itemsPerPage
                        )
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Schedule Maintenance Dialog */}
        <Dialog open={isSchedulingOpen} onOpenChange={setIsSchedulingOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Maintenance</DialogTitle>
              <DialogDescription>
                Schedule maintenance for project #{selectedProject?.id}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleScheduleMaintenance} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="scheduledDate">Date and Time</label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={schedulingForm.scheduledDate}
                  className="bg-secondary"
                  onChange={(e) =>
                    setSchedulingForm({
                      ...schedulingForm,
                      scheduledDate: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="notes">Notes</label>
                <Textarea
                  id="notes"
                  value={schedulingForm.notes}
                  onChange={(e) =>
                    setSchedulingForm({
                      ...schedulingForm,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Add any relevant notes..."
                />
              </div>
              <DialogFooter>
                <Button type="submit">Schedule Maintenance</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Reject Maintenance Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Maintenance</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this maintenance schedule
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                required
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsRejectDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRejectMaintenance}
                  disabled={!rejectionReason.trim()}
                >
                  Reject Maintenance
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CompanyMaintenanceProject;
