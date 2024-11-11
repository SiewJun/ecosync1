import { Info } from 'lucide-react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const StepGuide = ({ steps, isEditable }) => {
  const requiredSteps = [
    { type: "DEPOSIT", label: "Deposit", description: "Initial payment to begin the project" },
    { type: "DOCUMENT_UPLOAD", label: "Document Upload", description: "Required documentation and permits" },
    { type: "FINAL_PAYMENT", label: "Final Payment", description: "Remaining payment before installation" },
    { type: "INSTALLATION", label: "Installation", description: "Project installation phase" },
    { type: "COMPLETION", label: "Completion", description: "Final verification and project completion" }
  ];

  const getStepStatus = (stepType) => {
    const step = steps.find(s => s.stepType === stepType);
    return step ? "complete" : "pending";
  };

  if (!isEditable || steps.length === 5) return null;

  return (
    <Card className="mb-8 bg-secondary border rounded-lg p-6 shadow-sm">
      <CardHeader className="flex items-start space-x-3 mb-4">
        <Info className="h-5 w-5 mt-1" />
        <div>
          <CardTitle className="text-lg font-semibold">Project Setup Guide</CardTitle>
          <p className="text-sm">Create all 5 required steps in order to publish your project</p>
        </div>
      </CardHeader>
      
      <CardContent className="grid gap-3 mt-4">
        {requiredSteps.map((step, index) => {
          const status = getStepStatus(step.type);
          
          return (
            <div 
              key={step.type}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-md transition-all duration-200",
                status === 'complete' ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-200'
              )}
            >
              <div className={cn(
                "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
                status === 'complete' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              )}>
                {index + 1}
              </div>
              <div className="flex-grow">
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    "font-medium",
                    status === 'complete' ? 'text-green-700' : 'text-gray-900'
                  )}>
                    {step.label}
                  </span>
                  {status === 'complete' && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      Added
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

StepGuide.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      stepType: PropTypes.string.isRequired,
    })
  ).isRequired,
  isEditable: PropTypes.bool.isRequired,
};

export default StepGuide;