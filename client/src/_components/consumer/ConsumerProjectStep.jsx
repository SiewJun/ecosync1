import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Upload,
  CreditCard,
  CheckCircle,
  AlertCircle,
  PenTool,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const stepIcons = {
  DEPOSIT: CreditCard,
  DOCUMENT_UPLOAD: Upload,
  FINAL_PAYMENT: CreditCard,
  INSTALLATION: PenTool,
  COMPLETION: CheckCircle,
};

export default function ConsumerProjectSteps() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [documentFiles, setDocumentFiles] = useState([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProjectSteps();
  }, [projectId]);

  const fetchProjectSteps = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/project-step/consumer/${projectId}/steps`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProject(response.data.project);
      setSteps(response.data.steps);
      const pendingSteps = response.data.steps.filter(
        (step) => step.status === "PENDING"
      );
      setCurrentStep(pendingSteps.length > 0 ? pendingSteps[0] : null);
      setLoading(false);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch project steps. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (
      !currentStep ||
      !["DEPOSIT", "FINAL_PAYMENT"].includes(currentStep.stepType)
    )
      return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/stripe/create-checkout-session`,
        {
          projectId: project.id,
          stepId: currentStep.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      window.location.href = response.data.url;
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStepCompletion = async () => {
    if (!currentStep) return;

    if (currentStep.stepType === "DOCUMENT_UPLOAD" && documentFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please upload the required documents before completing the step.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (currentStep.stepType === "DOCUMENT_UPLOAD") {
        const formData = new FormData();
        documentFiles.forEach((file) => {
          formData.append("documents", file);
        });

        await axios.post(
          `http://localhost:5000/api/project-step/consumer/${projectId}/steps/${currentStep.id}/upload`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      toast({
        title: "Success",
        description: `${currentStep.stepName} completed successfully.`,
      });

      fetchProjectSteps();
      setDialogOpen(false);
      setDocumentFiles([]);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete the step. Please try again.",
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl h-screen flex flex-col">
      <Toaster />
      <div className="mb-6 flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/consumer-dashboard/consumer-project")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-500">Project Progress</h1>
      </div>

      <Card className="mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl text-gray-500">
            Project Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-gray-500">
            Company: {project.company.username}
          </p>
          <Progress value={calculateProgress()} className="w-full h-2" />
          <p className="mt-2 text-sm text-gray-500">
            {calculateProgress().toFixed(0)}% Complete
          </p>
        </CardContent>
      </Card>

      <ScrollArea className="flex-grow pr-4">
        <div className="container mx-auto p-4 md:p-6 max-w-4xl">
          <div className="space-y-6">
            {steps.map((step, index) => {
              const StepIcon = stepIcons[step.stepType] || AlertCircle;
              const isConsumerStep = [
                "DEPOSIT",
                "DOCUMENT_UPLOAD",
                "FINAL_PAYMENT",
              ].includes(step.stepType);
              const isCurrentStep = currentStep && currentStep.id === step.id;
              return (
                <Card
                  key={step.id}
                  className={`relative transition-all duration-300 ${
                    step.status === "COMPLETED"
                      ? "bg-green-50 border-green-200"
                      : isCurrentStep
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-white"
                  }`}
                >
                  <CardContent className="flex items-center p-4">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full mr-4 ${
                        step.status === "COMPLETED"
                          ? "bg-green-500"
                          : isCurrentStep
                          ? "bg-yellow-500"
                          : "bg-gray-300"
                      }`}
                    >
                      <StepIcon
                        className={`h-6 w-6 ${
                          step.status === "COMPLETED"
                            ? "text-white"
                            : isCurrentStep
                            ? "text-gray-800"
                            : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex-grow">
                      <h3
                        className={`text-base font-semibold ${
                          step.status === "COMPLETED"
                            ? "text-green-700"
                            : isCurrentStep
                            ? "text-yellow-700"
                            : "text-gray-700"
                        }`}
                      >
                        {step.stepName}
                      </h3>
                      <p className="text-sm text-gray-600">{step.description}</p>
                      {step.paymentAmount && (
                        <p className="text-sm font-semibold text-gray-700 mt-1">
                          Payment Amount: RM{step.paymentAmount}
                        </p>
                      )}
                    </div>
                    {isCurrentStep && isConsumerStep && (
                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="ml-4"
                            onClick={() => setDialogOpen(true)}
                          >
                            {step.stepType === "DEPOSIT" ||
                            step.stepType === "FINAL_PAYMENT"
                              ? "Pay Now"
                              : "Upload Documents"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{step.stepName}</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            {step.stepType === "DEPOSIT" ||
                            step.stepType === "FINAL_PAYMENT" ? (
                              <div className="space-y-4">
                                <p>Payment Amount: RM{step.paymentAmount}</p>
                                <Button onClick={handleCheckout}>
                                  Proceed to Payment
                                </Button>
                              </div>
                            ) : step.stepType === "DOCUMENT_UPLOAD" ? (
                              <div className="space-y-4">
                                <Input
                                  type="file"
                                  multiple
                                  onChange={(e) =>
                                    setDocumentFiles(Array.from(e.target.files))
                                  }
                                />
                                <Button onClick={handleStepCompletion}>
                                  Upload Documents
                                </Button>
                              </div>
                            ) : null}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    {!isConsumerStep && step.status !== "COMPLETED" && (
                      <Badge variant="secondary" className="ml-4">
                        Waiting for Company
                      </Badge>
                    )}
                    {step.status === "COMPLETED" && (
                      <CheckCircle className="h-6 w-6 text-green-500 ml-4" />
                    )}
                  </CardContent>
                  {index < steps.length - 1 && (
                    <div className="absolute left-10 top-16 bottom-0 w-0.5 bg-gray-200"></div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}