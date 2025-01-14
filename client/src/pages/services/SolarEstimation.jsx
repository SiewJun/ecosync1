import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import NavBar from "@/_components/nav/NavBar";
import { calculatePanels, calculateSavings } from "@/utils/SolarCalculator";
import UserDetailsForm from "@/_components/services/UserDetailsForm";
import MapComponent from "@/_components/services/MapComponent";
import NearbyCompanies from "@/_components/services/NearbyCompanies";
import AuthDialog from "@/_components/services/AuthDialog";
import SavingsCard from "@/_components/services/SavingsCard";
import InfoCard from "@/_components/services/InfoCard";

const SolarEstimation = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    salutation: "",
    name: "",
    email: "",
    phone: "",
    avgElectricityBill: "",
    address: "",
    propertyType: "",
    state: "",
  });
  const [location, setLocation] = useState(null);
  const [panelCount, setPanelCount] = useState(0);
  const [savings, setSavings] = useState(null);
  const [error, setError] = useState(null);
  const [isRoofMapped, setIsRoofMapped] = useState(false);
  const [nearbyCompanies, setNearbyCompanies] = useState([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [activeAuthTab, setActiveAuthTab] = useState("login");
  const [submittedQuotations, setSubmittedQuotations] = useState([]);
  const { toast } = useToast();
  const totalSteps = 4;

  const handleRequestQuotation = async (companyId) => {
    try {
      const userResponse = await fetch("http://localhost:5000/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      if (!userResponse.ok) {
        setIsAuthDialogOpen(true);
        return;
      }

      const userData = await userResponse.json();

      if (userData.user.role !== "CONSUMER") {
        toast({
          title: "Permission Denied",
          description:
            "Only consumers can request a quotation. Please contact support if you believe this is an error.",
          variant: "destructive",
        });
        return;
      }

      await submitQuotation(companyId);
      setSubmittedQuotations([...submittedQuotations, companyId]);
    } catch (error) {
      console.error("Error submitting quotation:", error);
      toast({
        title: "Error",
        description:
          "An error occurred while submitting the quotation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const submitQuotation = async (companyId) => {
    try {
      const quotationData = {
        companyId,
        salutation: formData.salutation,
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phone,
        electricityBill: formData.avgElectricityBill,
        propertyType: formData.propertyType,
        address: formData.address,
        state: formData.state,
      };

      const response = await fetch(
        "http://localhost:5000/api/quotation/submit-quotation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(quotationData),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Quotation submitted successfully!",
        });
      } else {
        throw new Error("Failed to submit the quotation");
      }
    } catch (error) {
      console.error("Error submitting quotation:", error);
      throw error;
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        toast({
          title: "Logged In",
          description: "You have successfully logged in.",
        });
        setIsAuthDialogOpen(false);
        setAuthError(null);
      } else {
        setAuthError("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("An error occurred during login");
    }
  };

  const handleRegister = async (username, email, password) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ username, email, password, role: "CONSUMER" }),
        }
      );

      if (response.ok) {
        toast({
          title: "Registration Successful",
          description: "Please log in to continue.",
        });
        setActiveAuthTab("login");
      } else {
        const errorData = await response.json();
        setAuthError(errorData.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setAuthError("An error occurred during registration");
    }
  };

  const handleFormSubmit = async (data, coordinates) => {
    setFormData(data);
    setError(null);
    setLocation(coordinates);
    setStep(2);
  };

  useEffect(() => {
    if (step === 4 && formData.address) {
      fetchNearbyCompanies();
    }
  }, [step, formData.address]);

  const fetchNearbyCompanies = async () => {
    setIsLoadingCompanies(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/get-estimate/nearby-companies?address=${encodeURIComponent(
          formData.address
        )}`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Failed to fetch nearby companies");
      const data = await response.json();
      setNearbyCompanies(data);
    } catch (error) {
      console.error("Error fetching nearby companies:", error);
      setError(
        "Failed to fetch nearby solar companies. Please try again later."
      );
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const handlePolygonComplete = (area) => {
    const panels = calculatePanels(area);
    setPanelCount(panels);
    setIsRoofMapped(true);
  };

  const handleCalculateSavings = () => {
    if (formData) {
      const { avgElectricityBill } = formData;
      const calculatedSavings = calculateSavings(
        avgElectricityBill,
        panelCount
      );
      setSavings(calculatedSavings);
      setStep(4);
    }
  };

  const canProceedToNextStep = () => {
    switch (step) {
      case 1:
        return Object.values(formData).every((value) => value !== "");
      case 2:
        return isRoofMapped;
      case 3:
        return savings !== null; // Ensure savings are calculated before proceeding
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <UserDetailsForm onSubmit={handleFormSubmit} initialData={formData} />
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Map Your Roof</h2>
            <p className="text-gray-600 mb-4">
              Use the map below to outline your roof area. This helps us
              estimate the number of solar panels that can be installed.
            </p>
            <MapComponent
              center={location}
              onPolygonComplete={handlePolygonComplete}
            />
            {isRoofMapped && (
              <Alert variant="success" className="mt-4">
                <AlertDescription>
                  Roof area successfully mapped!
                </AlertDescription>
              </Alert>
            )}
          </div>
        );
      case 3:
        return (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Panel Estimate</h2>
            <div className="p-6 rounded-lg border-2">
              <p className="text-4xl font-bold text-green-600 mb-2">
                {panelCount}
              </p>
              <p className="text-gray-600">Estimated Panels</p>
            </div>
            <Button
              onClick={handleCalculateSavings}
              className="w-full max-w-md"
              size="lg"
            >
              Estimate Savings
            </Button>
          </div>
        );
      case 4:
        return (
          <div className="max-w-4xl mx-auto space-y-16">
            {/* Results Overview Section */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-semibold">Your Solar Solution</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Based on your roof space and energy consumption, here&apos;s
                your personalized solar solution
              </p>
            </div>

            {/* Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InfoCard
                systemSize={savings.recommendedKWp}
                panelCount={savings.panelsForRecommendedKWp}
              />
              <SavingsCard
                oldValue={savings.oldBill}
                newValue={savings.newBill}
                unit="RM"
              />
            </div>

            {/* Elegant Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-6 py-3 text-base font-medium bg-background">
                  Available Solar Installers
                </span>
              </div>
            </div>

            {/* Companies Section */}
            <div className="rounded-xl">
              <NearbyCompanies
                companies={nearbyCompanies}
                isLoading={isLoadingCompanies}
                handleRequestQuotation={handleRequestQuotation}
                submittedQuotations={submittedQuotations}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="container mx-auto my-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Get Estimate</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Progress value={(step / totalSteps) * 100} className="w-full" />
          <p className="text-center mt-2 text-sm text-gray-600">
            Step {step} of {totalSteps}
          </p>
        </div>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="overflow-hidden shadow-lg">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-8">
          <Button
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            disabled={step === 1}
            variant="outline"
            className="px-6 py-2"
          >
            <ArrowLeft className="mr-2" /> Back
          </Button>
          <Button
            onClick={() => setStep((prev) => Math.min(totalSteps, prev + 1))}
            disabled={step === totalSteps || !canProceedToNextStep()}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white"
          >
            {step === totalSteps ? "Finish" : "Next"}{" "}
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>
      <Toaster />
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        error={authError}
        activeTab={activeAuthTab}
        setActiveTab={setActiveAuthTab}
      />
    </div>
  );
};

export default SolarEstimation;
