import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Edit,
  Trash,
  Plus,
  ArrowLeft,
  AlertCircle,
  Upload,
  CreditCard,
  CheckCircle,
  File,
  PenTool,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const stepTypes = [
  { value: "DEPOSIT", label: "Deposit" },
  { value: "DOCUMENT_UPLOAD", label: "Document Upload" },
  { value: "FINAL_PAYMENT", label: "Final Payment" },
  { value: "INSTALLATION", label: "Installation" },
  { value: "COMPLETION", label: "Completion" },
];

const stepIcons = {
  DEPOSIT: CreditCard,
  DOCUMENT_UPLOAD: Upload,
  FINAL_PAYMENT: CreditCard,
  INSTALLATION: PenTool,
  COMPLETION: CheckCircle,
};

const CompanyProjectStep = () => {
  const { projectId } = useParams();
  const [steps, setSteps] = useState([]);
  const [project, setProject] = useState(null);
  const [projectStatus, setProjectStatus] = useState("");
  const [newStep, setNewStep] = useState({
    stepName: "",
    description: "",
    stepType: "",
    paymentAmount: "",
    isMandatory: true,
    dueDate: "",
    stepOrder: 1,
  });
  const [editStepId, setEditStepId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [canPublish, setCanPublish] = useState(false);
  const token = localStorage.getItem("token");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [completedSteps, setCompletedSteps] = useState([]);
  const isEditable = projectStatus === "PENDING";
  const isInProgress = projectStatus === "IN_PROGRESS";
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [currentDocuments, setCurrentDocuments] = useState([]);

  const checkCanPublish = useCallback(() => {
    const sortedSteps = [...steps].sort((a, b) => a.stepOrder - b.stepOrder);
    const isConsecutive = sortedSteps.every(
      (step, index) => step.stepOrder === index + 1
    );
    setCanPublish(
      sortedSteps.length === 5 &&
        isConsecutive &&
        projectStatus !== "IN_PROGRESS"
    );
  }, [steps, projectStatus]);

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  useEffect(() => {
    checkCanPublish();
  }, [steps, checkCanPublish]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/project-step/company/${projectId}/steps`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSteps(response.data.steps);
      setProject(response.data.project);
      setProjectStatus(response.data.project.status);
      setCompletedSteps(
        response.data.steps
          .filter((step) => step.status === "COMPLETED")
          .map((step) => step.id)
      );
      setLoading(false);
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch project data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePublishProject = async () => {
    if (!isEditable) return;
    try {
      await axios.put(
        `http://localhost:5000/api/project-step/${projectId}/publish`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: "Success",
        description: "Project successfully published!",
      });
      fetchProjectData();
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish the project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const validateStepOrder = (stepOrder) => {
    const existingOrders = steps.map((step) => step.stepOrder);
    const maxOrder = Math.max(...existingOrders, 0);
    return (
      stepOrder >= 1 &&
      stepOrder <= 5 &&
      !existingOrders.includes(stepOrder) &&
      stepOrder <= maxOrder + 1
    );
  };

  const validateFields = () => {
    const {
      stepName,
      description,
      stepType,
      paymentAmount,
      dueDate,
      stepOrder,
    } = newStep;
    if (!stepName || !description || !stepType || !dueDate || !stepOrder) {
      return false;
    }
    if (
      (stepType === "DEPOSIT" || stepType === "FINAL_PAYMENT") &&
      !paymentAmount
    ) {
      return false;
    }
    return true;
  };

  const handleAddStep = async () => {
    if (!isEditable) return;
    if (!validateStepOrder(newStep.stepOrder)) {
      setErrorMessage(
        "Invalid step order. Ensure it is between 1 and 5, not already used, and not skipping any order."
      );
      return;
    }
    if (!validateFields()) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }
    const stepData = {
      ...newStep,
      paymentAmount:
        (newStep.stepType === "DEPOSIT" ||
          newStep.stepType === "FINAL_PAYMENT") &&
        newStep.paymentAmount !== ""
          ? newStep.paymentAmount
          : null,
    };
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/project-step/${projectId}/steps`,
        {
          steps: [stepData],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSteps([...steps, ...response.data.steps]);
      resetForm();
      toast({
        title: "Success",
        description: "Step added successfully.",
      });
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add step. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsDialogOpen(false);
    }
  };

  const handleEditStep = async (stepId) => {
    if (!isEditable) return;
    if (!validateStepOrder(newStep.stepOrder)) {
      setErrorMessage(
        "Invalid step order. Ensure it is between 1 and 5, not already used, and not skipping any order."
      );
      return;
    }
    if (!validateFields()) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:5000/api/project-step/${projectId}/steps/${stepId}`,
        {
          stepData: newStep,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedSteps = steps.map((step) =>
        step.id === stepId ? response.data.step : step
      );
      setSteps(updatedSteps);
      resetForm();
      toast({
        title: "Success",
        description: "Step updated successfully.",
      });
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update step. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsDialogOpen(false);
    }
  };

  const handleDeleteStep = async (stepId) => {
    if (!isEditable) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/project-step/${projectId}/steps/${stepId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSteps(steps.filter((step) => step.id !== stepId));
      toast({
        title: "Success",
        description: "Step deleted successfully.",
      });
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete step. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewDocuments = (step) => {
    if (step.stepType === "DOCUMENT_UPLOAD" && step.status === "COMPLETED") {
      setCurrentDocuments(step.filePaths || []);
      setIsDocumentDialogOpen(true);
    }
  };

  const handleChange = (name, value) => {
    setNewStep((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setNewStep({
      stepName: "",
      description: "",
      stepType: "DEPOSIT",
      paymentAmount: "",
      isMandatory: true,
      dueDate: "",
      stepOrder: steps.length + 1,
    });
    setEditStepId(null);
    setErrorMessage("");
  };

  const openEditDialog = (step) => {
    if (!isEditable) return;
    setNewStep({
      ...step,
      dueDate: step.dueDate
        ? new Date(step.dueDate).toISOString().split("T")[0]
        : "",
    });
    setEditStepId(step.id);
    setIsDialogOpen(true);
  };

  const handleMarkStepComplete = async (stepId) => {
    if (!isInProgress) return;
    try {
      const response = await axios.put(
        `http://localhost:5000/api/project-step/${projectId}/steps/${stepId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedSteps = steps.map((step) =>
        step.id === stepId ? { ...step, status: "COMPLETED" } : step
      );
      setSteps(updatedSteps);
      setCompletedSteps([...completedSteps, stepId]);

      // Check if the project status has been updated to COMPLETED
      if (response.data.projectStatus === "COMPLETED") {
        setProjectStatus("COMPLETED");
        toast({
          title: "Success",
          description: "Project has been marked as completed!",
        });
      } else {
        toast({
          title: "Success",
          description: "Step marked as completed successfully.",
        });
      }

      // Refresh project data to get the latest status
      fetchProjectData();
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark step as completed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateProgress = () => {
    const completedSteps = steps.filter(
      (step) => step.status === "COMPLETED"
    ).length;
    return (completedSteps / steps.length) * 100;
  };

  if (loading && steps.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl h-screen flex flex-col">
      <Toaster />
      <div className="mb-6 flex items-center space-x-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/company-dashboard/company-project")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Back to Projects</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex flex-col">
          <h3 className="text-xl font-bold">Project Steps</h3>
          <p className="text-sm text-muted-foreground">
            Project ID: {projectId}
          </p>
        </div>
      </div>
      {project && (
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-gray-500">
              Project Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-gray-600">
              Consumer: {project.consumer.username}
            </p>
            <Progress value={calculateProgress()} className="w-full h-2" />
            <p className="mt-2 text-sm text-gray-500">
              {calculateProgress().toFixed(0)}% Complete
            </p>
          </CardContent>
        </Card>
      )}

      <ScrollArea className="flex-grow pr-4">
        <div className="container mx-auto p-4 md:p-6 max-w-4xl">
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <div className="flex space-x-2">
              {isEditable && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        resetForm();
                        setIsDialogOpen(true);
                      }}
                      className="shadow-sm hover:shadow-md transition-shadow"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add New Step
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editStepId ? "Edit Step" : "Add New Step"}
                      </DialogTitle>
                      <DialogDescription>
                        {editStepId
                          ? "Edit the details of the existing step."
                          : "Add a new step to your project."}
                      </DialogDescription>
                    </DialogHeader>
                    {errorMessage && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{errorMessage}</AlertDescription>
                      </Alert>
                    )}
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="stepName">Step Name</Label>
                        <Input
                          id="stepName"
                          value={newStep.stepName}
                          onChange={(e) =>
                            handleChange("stepName", e.target.value)
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newStep.description}
                          onChange={(e) =>
                            handleChange("description", e.target.value)
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="stepType">Step Type</Label>
                        <Select
                          value={newStep.stepType}
                          onValueChange={(value) =>
                            handleChange("stepType", value)
                          }
                        >
                          <SelectTrigger id="stepType">
                            <SelectValue placeholder="Select step type" />
                          </SelectTrigger>
                          <SelectContent>
                            {stepTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {(newStep.stepType === "DEPOSIT" ||
                        newStep.stepType === "FINAL_PAYMENT") && (
                        <div className="grid gap-2">
                          <Label htmlFor="paymentAmount">Payment Amount</Label>
                          <Input
                            id="paymentAmount"
                            type="number"
                            value={newStep.paymentAmount}
                            onChange={(e) =>
                              handleChange("paymentAmount", e.target.value)
                            }
                          />
                        </div>
                      )}
                      <div className="grid gap-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={newStep.dueDate}
                          onChange={(e) =>
                            handleChange("dueDate", e.target.value)
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="stepOrder">Step Order</Label>
                        <Input
                          id="stepOrder"
                          type="number"
                          value={newStep.stepOrder}
                          onChange={(e) =>
                            handleChange("stepOrder", e.target.value)
                          }
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isMandatory"
                          checked={newStep.isMandatory}
                          onCheckedChange={(checked) =>
                            handleChange("isMandatory", checked)
                          }
                        />
                        <Label htmlFor="isMandatory">Mandatory</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() =>
                          editStepId
                            ? handleEditStep(editStepId)
                            : handleAddStep()
                        }
                      >
                        {editStepId ? "Update Step" : "Add Step"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              {canPublish && projectStatus !== "IN_PROGRESS" && isEditable && (
                <Button onClick={handlePublishProject}>Publish</Button>
              )}
            </div>
          </div>
          {steps.length === 0 && !loading && (
            <Card className="mt-8">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <CardDescription className="text-center">
                  No steps have been added to this project yet.
                  <br />
                  {isEditable
                    ? 'Click the "Add New Step" button to get started.'
                    : "Steps cannot be added as the project is no longer in PENDING status."}
                </CardDescription>
              </CardContent>
            </Card>
          )}
          <div className="space-y-6">
            {steps
              .sort((a, b) => a.stepOrder - b.stepOrder)
              .map((step, index) => {
                const StepIcon = stepIcons[step.stepType] || AlertCircle;
                const isCompanyStep = ["INSTALLATION", "COMPLETION"].includes(
                  step.stepType
                );
                const isStepAvailable =
                  index === 0 || completedSteps.includes(steps[index - 1].id);

                return (
                  <Card
                    key={step.id}
                    className={`relative transition-all duration-300 ${
                      step.status === "COMPLETED"
                        ? "bg-green-50 border-green-200"
                        : step.status === "PENDING" && isCompanyStep
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-background"
                    }`}
                  >
                    <CardContent className="flex items-center p-4">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-full mr-4 ${
                          step.status === "COMPLETED"
                            ? "bg-green-500"
                            : step.status === "PENDING" && isCompanyStep
                            ? "bg-yellow-500"
                            : "bg-gray-300"
                        }`}
                      >
                        <StepIcon
                          className={`h-6 w-6 ${
                            step.status === "COMPLETED"
                              ? "text-white"
                              : step.status === "PENDING" && isCompanyStep
                              ? "text-gray-800"
                              : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div className="flex-grow">
                        <h3
                          className={`text-base font-semibold ${
                            step.status === "COMPLETED"
                              ? "text-green-500"
                              : step.status === "PENDING" && isCompanyStep
                              ? "text-yellow-500"
                              : "text-gray-500"
                          }`}
                        >
                          {step.stepName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {step.description}
                        </p>
                        {step.paymentAmount && (
                          <p className="text-sm font-semibold text-gray-500 mt-1">
                            Payment Amount: RM{step.paymentAmount}
                          </p>
                        )}
                        <div className="flex-col items-center mt-2 sm:space-x-2">
                          <Badge
                            variant={
                              step.status === "COMPLETED"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {step.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`${
                              step.status === "PENDING" && isCompanyStep
                                ? "text-black"
                                : "text-foreground"
                            } ${step.status === "COMPLETED" && "text-black"}`}
                          >
                            Due: {new Date(step.dueDate).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                      {isEditable && (
                        <div className="flex space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(step)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit Step</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteStep(step.id)}
                                  className="hover:bg-destructive/10 transition-colors"
                                >
                                  <Trash className="h-4 w-4 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete Step</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                      {isInProgress &&
                        isCompanyStep &&
                        step.status !== "COMPLETED" &&
                        isStepAvailable && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkStepComplete(step.id)}
                            className="ml-4"
                          >
                            Mark Complete
                          </Button>
                        )}
                      {!isStepAvailable && (
                        <Badge variant="secondary" className="ml-4">
                          Not available
                        </Badge>
                      )}
                      {step.stepType === "DOCUMENT_UPLOAD" &&
                        step.status === "COMPLETED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDocuments(step)}
                            className="ml-2"
                          >
                            <Eye/>
                          </Button>
                        )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      </ScrollArea>

      <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uploaded Documents</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {currentDocuments.map((doc, index) => (
              <div key={index} className="flex items-center space-x-2">
                <File className="h-6 w-6" />
                <a href={`http://localhost:5000/${doc}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  Document {index + 1}
                </a>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDocumentDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyProjectStep;