import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  FileText,
} from 'lucide-react';

const ConsumerProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost:5000/api/project/consumer-projects',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProjects(response.data.projects);
        console.log(response.data.projects);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setProjects([]);
        } else {
          setError('Failed to load projects. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const closeDetails = () => {
    setSelectedProject(null);
  };

  const getStatusColor = (status) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELAYED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepIcon = (status) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'IN_PROGRESS':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'PENDING':
        return <Calendar className="h-5 w-5 text-yellow-500" />;
      case 'DELAYED':
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
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {projects.length === 0 ? (
        <Card className="bg-muted">
          <CardContent className="flex flex-col items-center justify-center h-32">
            <Building2 className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-center text-sm text-muted-foreground">
              No projects available.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {projects.map((project) => (
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
                          src={`http://localhost:5000/${project.company.avatarUrl}`}
                          alt={project.company.CompanyDetail.companyName}
                        />
                        <AvatarFallback>
                          <Building2 className="h-6 w-6" />
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
                      {project.company.CompanyDetail.companyName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mb-4">
                      Project accepted on{' '}
                      {new Date(project.startDate).toLocaleDateString()}
                    </p>
                    <div className="space-y-2">
                      {project.steps.slice(0, 3).map((step) => (
                        <div
                          key={step.id}
                          className="flex items-center text-sm"
                        >
                          {getStepIcon(step.status)}
                          <span className="ml-2">{step.stepName}</span>
                        </div>
                      ))}
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
      )}

      <Dialog open={!!selectedProject} onOpenChange={closeDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Project Details
            </DialogTitle>
            <DialogDescription>
              View the details and progress of your solar project.
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <ScrollArea className="mt-4 max-h-[60vh]">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedProject.company.CompanyDetail.companyName}
                    </h3>
                  </div>
                  <Badge className={`${getStatusColor(selectedProject.status)}`}>
                    {selectedProject.status}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Project Timeline</h4>
                  <div className="space-y-4">
                    {selectedProject.steps.map((step) => (
                      <div
                        key={step.id}
                        className="flex items-start border-l-2 pl-4 pb-4"
                      >
                        <div className="mr-4">
                          {getStepIcon(step.status)}
                        </div>
                        <div>
                          <p className="font-medium">{step.stepName}</p>
                          <p className="text-sm">
                            {step.status}
                          </p>
                          {step.dueDate && (
                            <p className="text-sm">
                              Due: {new Date(step.dueDate).toLocaleDateString()}
                            </p>
                          )}
                          {step.completedAt && (
                            <p className="text-sm">
                              Completed: {new Date(step.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Company Information</h4>
                  <p>
                    <strong>Address:</strong> {selectedProject.company.CompanyDetail.address}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedProject.company.CompanyDetail.phoneNumber}
                  </p>
                  <p>
                    <strong>Website:</strong> 
                    <a
                      href={selectedProject.company.CompanyDetail.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {selectedProject.company.CompanyDetail.website}
                    </a>
                  </p>
                </div>
              </div>
            </ScrollArea>
          )}
          <div className="mt-6 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={closeDetails}
            >
              Close
            </Button>
            <Button
              onClick={() =>
                navigate(`/consumer-dashboard/project/${selectedProject.id}`)
              }
            >
              View Full Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsumerProjects;