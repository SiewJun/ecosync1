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

const stepTypes = [
  { value: "DEPOSIT", label: "Deposit" },
  { value: "DOCUMENT_UPLOAD", label: "Document Upload" },
  { value: "FINAL_PAYMENT", label: "Final Payment" },
  { value: "INSTALLATION", label: "Installation" },
  { value: "COMPLETION", label: "Completion" },
];

const CompanyProjectStep = () => {
  const { projectId } = useParams();
  const [steps, setSteps] = useState([]);
  const [projectStatus, setProjectStatus] = useState("");
  const [newStep, setNewStep] = useState({
    stepName: "",
    description: "",
    stepType: "DEPOSIT",
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

  const isEditable = projectStatus === "PENDING";

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
        `http://localhost:5000/api/project-step/${projectId}/steps`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSteps(response.data.steps);
      setProjectStatus(response.data.projectStatus);
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

  if (loading && steps.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Toaster />
      <header className="p-4 shadow-md border-b">
        <div className="flex items-center space-x-4 max-w-4xl mx-auto">
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
            <h3 className="text-xl font-semibold">Project Steps</h3>
            <p className="text-sm text-muted-foreground">
              Project ID: {projectId}
            </p>
          </div>
        </div>
      </header>
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
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
                      onChange={(e) => handleChange("stepName", e.target.value)}
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
                      onValueChange={(value) => handleChange("stepType", value)}
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
                      onChange={(e) => handleChange("dueDate", e.target.value)}
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
                      editStepId ? handleEditStep(editStepId) : handleAddStep()
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
                .map((step) => (
                  <Card key={step.id} className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{step.stepName}</CardTitle>
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
                </div>
                <CardDescription>
                  Step {step.stepOrder}: {step.stepType}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">
                  {step.description}
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center">
                    <Label className="mr-2 text-muted-foreground">Due:</Label>
                    <span>
                      {step.dueDate
                        ? new Date(step.dueDate).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  {step.paymentAmount && (
                    <div className="flex items-center">
                      <Label className="mr-2 text-muted-foreground">
                        Payment:
                      </Label>
                      <span>RM{step.paymentAmount}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Label className="mr-2 text-muted-foreground">
                      Mandatory:
                    </Label>
                    <span>{step.isMandatory ? "Yes" : "No"}</span>
                  </div>
                </div>
              </CardContent>
              </Card>
                ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default CompanyProjectStep;
