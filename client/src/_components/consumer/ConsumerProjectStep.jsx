import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Upload, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const stepIcons = {
  DEPOSIT: CreditCard,
  DOCUMENT_UPLOAD: Upload,
  FINAL_PAYMENT: CreditCard,
  INSTALLATION: CheckCircle,
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
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProjectSteps();
  }, [projectId]);

  const fetchProjectSteps = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/project-step/consumer/${projectId}/steps`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(response.data.project);
      setSteps(response.data.steps);
      setCurrentStep(response.data.steps.find(step => step.status === 'PENDING'));
      setLoading(false);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch project steps. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
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
      window.location.href = response.data.url; // Redirect to Stripe Checkout
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initiate checkout. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleStepCompletion = async () => {
    if (!currentStep) return;

    try {
      if (currentStep.stepType === 'DOCUMENT_UPLOAD') {
        const formData = new FormData();
        documentFiles.forEach((file) => {
          formData.append('documents', file);
        });

        await axios.post(
          `http://localhost:5000/api/project-step/consumer/${projectId}/steps/${currentStep.id}/upload`,
          formData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            } 
          }
        );
      } else {
        await axios.post(
          `http://localhost:5000/api/consumer/${projectId}/steps/${currentStep.id}/complete`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      toast({
        title: 'Success',
        description: `${currentStep.stepName} completed successfully.`,
      });

      fetchProjectSteps();
      setDialogOpen(false);
      setDocumentFiles([]);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete the step. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const calculateProgress = () => {
    const completedSteps = steps.filter(step => step.status === 'COMPLETED').length;
    return (completedSteps / steps.length) * 100;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl h-screen flex flex-col">
      <Toaster />
      <div className="mb-6 flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/consumer-dashboard/consumer-project')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Project Progress</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle></CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2">Company: {project.company.username}</p>
          <Progress value={calculateProgress()} className="w-full" />
          <p className="mt-2 text-sm text-gray-600">{calculateProgress().toFixed(0)}% Complete</p>
        </CardContent>
      </Card>

      <ScrollArea className="flex-grow">
        <div className="space-y-4 pr-4">
          {steps.map((step, index) => {
            const StepIcon = stepIcons[step.stepType] || AlertCircle;
            return (
              <Card key={step.id} className={`relative ${step.status === 'COMPLETED' ? 'bg-green-50' : ''}`}>
                <CardContent className="flex items-center p-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full mr-4 
                    ${step.status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-200'}`}>
                    <StepIcon className={`h-6 w-6 ${step.status === 'COMPLETED' ? 'text-foreground' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-grow">
                    <h3 className={ `text-lg font-semibold ${step.status === 'COMPLETED' ? 'text-black' : 'text-gray-500'}`}>{step.stepName}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                  {step.status === 'PENDING' && step.id === currentStep?.id && (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>Complete Step</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Complete {step.stepName}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          {step.stepType === 'DEPOSIT' || step.stepType === 'FINAL_PAYMENT' ? (
                            <div className="space-y-4">
                              <p>Payment Amount: RM{step.paymentAmount}</p>
                              <Button onClick={handleCheckout}>Proceed to Payment</Button>
                            </div>
                          ) : step.stepType === 'DOCUMENT_UPLOAD' ? (
                            <div className="space-y-4">
                              <Input
                                type="file"
                                multiple
                                onChange={(e) => setDocumentFiles(Array.from(e.target.files))}
                              />
                              <Button onClick={handleStepCompletion}>Upload Documents</Button>
                            </div>
                          ) : (
                            <Button onClick={handleStepCompletion}>Mark as Completed</Button>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  {step.status === 'COMPLETED' && (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  )}
                </CardContent>
                {index < steps.length - 1 && (
                  <div className="absolute left-7 top-14 bottom-0 w-0.5 bg-gray-200"></div>
                )}
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}