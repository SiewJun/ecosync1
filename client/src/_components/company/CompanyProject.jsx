import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  FileText,
  DollarSign,
  Zap,
  TrendingUp,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const ITEMS_PER_PAGE = 9;

const CompanyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/project/company-projects",
          {
            withCredentials: true, // Include credentials in the request
          }
        );
        setProjects(response.data.projects);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setProjects([]);
        } else {
          setError("Failed to load projects. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.consumer?.username
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "ALL" || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const closeDetails = () => {
    setSelectedProject(null);
  };

  const getStatusColor = (status) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "DELAYED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStepIcon = (status) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "IN_PROGRESS":
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case "PENDING":
        return <Calendar className="h-5 w-5 text-yellow-500" />;
      case "DELAYED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center mt-8 gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {[...Array(totalPages)].map((_, index) => (
          <Button
            key={index + 1}
            variant={currentPage === index + 1 ? "default" : "outline"}
            size="icon"
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </Button>
        ))}

        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const sortSteps = (steps) => {
    return steps.sort((a, b) => {
      // First, sort by stepOrder if it exists
      if (a.stepOrder !== undefined && b.stepOrder !== undefined) {
        return a.stepOrder - b.stepOrder;
      }

      // If stepOrder doesn't exist, sort by due date
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateA - dateB;
    });
  };

  return (
    <div className="min-h-screen container p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Input
            placeholder="Search by consumer name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-1/3"
          />
          <Select value={filterStatus} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="DELAYED">Delayed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {filteredProjects.length === 0 ? (
          <Card className="bg-muted max-w-5xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center h-32">
              <Building2 className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-center text-sm text-muted-foreground">
                No projects available.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {currentProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card
                      className="h-full cursor-pointer hover:shadow-lg transition-shadow duration-300"
                      onClick={() => handleProjectClick(project)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={`http://localhost:5000/${project.consumer.avatarUrl}`}
                              alt={project.consumer.username}
                            />
                            <AvatarFallback>
                              {project.consumer.username.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <Badge
                            className={`${getStatusColor(project.status)}`}
                          >
                            {project.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardTitle className="mb-2">
                          {project.consumer.username}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mb-4">
                          Project started on{" "}
                          {new Date(project.startDate).toLocaleDateString()}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                            <span>
                              System Size:{" "}
                              {project.quotation.versions[0].systemSize}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                            <span>
                              Savings: {project.quotation.versions[0].savings}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                            <span>
                              ROI: {project.quotation.versions[0].roi}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="ghost"
                          className="w-full justify-between"
                        >
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <Pagination />
          </>
        )}
        <Dialog open={!!selectedProject} onOpenChange={closeDetails}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Project Details</DialogTitle>
              <DialogDescription>
                View the details and progress of your solar project.
              </DialogDescription>
            </DialogHeader>
            {selectedProject && (
              <ScrollArea className="mt-4 max-h-[60vh]">
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {selectedProject.consumer.username}
                      </h3>
                      <p>Project ID: {selectedProject.id}</p>
                      <p>Quotation ID: {selectedProject.quotation.id}</p>
                    </div>
                    <Badge
                      className={`${getStatusColor(
                        selectedProject.status
                      )} mt-2 sm:mt-0`}
                    >
                      {selectedProject.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Project Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <InfoItem
                          label="Start Date"
                          value={new Date(
                            selectedProject.startDate
                          ).toLocaleDateString()}
                        />
                        <InfoItem
                          label="Property Type"
                          value={selectedProject.quotation.propertyType}
                        />
                        <InfoItem
                          label="Address"
                          value={selectedProject.quotation.address}
                        />
                        <InfoItem
                          label="State"
                          value={selectedProject.quotation.state}
                        />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>System Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <InfoItem
                          label="System Size"
                          value={
                            selectedProject.quotation.versions[0].systemSize
                          }
                        />
                        <InfoItem
                          label="Panel Specifications"
                          value={
                            selectedProject.quotation.versions[0]
                              .panelSpecifications
                          }
                        />
                        <InfoItem
                          label="Estimated Energy Production"
                          value={
                            selectedProject.quotation.versions[0]
                              .estimatedEnergyProduction
                          }
                        />
                        <InfoItem
                          label="Average Monthly Electricity Bill"
                          value={`RM ${selectedProject.quotation.versions[0].averageMonthlyElectricityBill}`}
                        />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Financial Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <InfoItem
                          label="Savings"
                          value={selectedProject.quotation.versions[0].savings}
                        />
                        <InfoItem
                          label="Payback Period"
                          value={
                            selectedProject.quotation.versions[0].paybackPeriod
                          }
                        />
                        <InfoItem
                          label="ROI"
                          value={selectedProject.quotation.versions[0].roi}
                        />
                        <InfoItem
                          label="Incentives"
                          value={
                            selectedProject.quotation.versions[0].incentives
                          }
                        />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Cost Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2">Item</th>
                                <th className="text-left py-2">Quantity</th>
                                <th className="text-left py-2">Unit Price</th>
                                <th className="text-left py-2">Total Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedProject.quotation.versions[0].costBreakdown.map(
                                (item, index) => (
                                  <tr
                                    key={index}
                                    className="border-b last:border-b-0"
                                  >
                                    <td className="py-2">{item.item}</td>
                                    <td className="py-2">{item.quantity}</td>
                                    <td className="py-2">
                                      RM {item.unitPrice}
                                    </td>
                                    <td className="py-2">
                                      RM {item.totalPrice}
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedProject.steps &&
                      selectedProject.steps.length > 0 ? (
                        <div className="space-y-4">
                          {sortSteps(selectedProject.steps).map(
                            (step, index) => (
                              <div
                                key={index}
                                className="flex items-start border-l-2 pl-4 pb-4"
                              >
                                <div className="mr-4">
                                  {getStepIcon(step.status)}
                                </div>
                                <div>
                                  <p className="font-medium">{step.stepName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {step.status}
                                  </p>
                                  {step.dueDate && (
                                    <p className="text-sm text-muted-foreground">
                                      Due:{" "}
                                      {new Date(
                                        step.dueDate
                                      ).toLocaleDateString()}
                                    </p>
                                  )}
                                  {step.completedAt && (
                                    <p className="text-sm text-muted-foreground">
                                      Completed:{" "}
                                      {new Date(
                                        step.completedAt
                                      ).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          You haven&apos;t drafted the steps for this solar
                          journey yet. Draft Now!
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Consumer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <InfoItem
                        label="Email"
                        value={selectedProject.consumer.email}
                      />
                      <InfoItem
                        label="Name"
                        value={selectedProject.quotation.name || "N/A"}
                      />
                      <InfoItem
                        label="Consumer's Project Phone"
                        value={selectedProject.quotation.phoneNumber || "N/A"}
                      />
                      <InfoItem
                        label="Consumer's Address"
                        value={
                          selectedProject.consumer.ConsumerProfile?.address ||
                          "N/A"
                        }
                      />
                      <InfoItem
                        label="Consumer Phone"
                        value={
                          selectedProject.consumer.ConsumerProfile
                            ?.phoneNumber || "N/A"
                        }
                      />
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            )}
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={closeDetails}>
                Close
              </Button>
              <Button
                onClick={() =>
                  navigate(
                    `/company-dashboard/company-project/${selectedProject.id}`
                  )
                }
              >
                {selectedProject?.status === "IN_PROGRESS"
                  ? "View Progress"
                  : selectedProject?.status === "COMPLETED"
                  ? "View"
                  : "Customise Timeline"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

import PropTypes from "prop-types";

const InfoItem = ({ label, value }) => (
  <div className="flex flex-wrap">
    <span className="font-medium w-1/3">{label}:</span>
    <span className="w-2/3">{value}</span>
  </div>
);
InfoItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default CompanyProjects;
