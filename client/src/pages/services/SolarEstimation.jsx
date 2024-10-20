import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Globe, ArrowLeft, ArrowRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import MapComponent from "@/_components/services/MapComponent";
import UserDetailsForm from "@/_components/services/UserDetailsForm";
import NavBar from "@/_components/nav/NavBar";
import { calculatePanels, calculateSavings } from "@/utils/SolarCalculator";

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
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
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
      setSubmittedQuotations([...submittedQuotations, companyId]); // Mark quotation as submitted
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
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
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
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
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
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, role: "CONSUMER" }),
      });

      if (response.ok) {
        toast({
          title: "Registration Successful",
          description: "Please log in to continue.",
        });
        setActiveAuthTab("login"); // Switch to login tab after successful registration
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
        )}`
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
        return true; // User can always proceed from panel estimate to solar savings
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
              Calculate Solar Impact
            </Button>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Your Solar Savings</h2>
            <Alert
              className="mt-6"
              variant={savings.coversFullBill ? "success" : "info"}
            >
              <AlertDescription>
                {savings.coversFullBill
                  ? "Your solar installation will cover your entire electricity bill!"
                  : `Your solar installation will cover ${Math.round(
                      (savings.newBill / savings.oldBill) * 100
                    )}% of your bill.`}
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SavingsCard
                title="Monthly Savings"
                oldValue={savings.oldBill}
                newValue={savings.newBill}
                unit="RM"
              />
              <SavingsCard
                title="Annual Savings"
                value={savings.annualSavings}
                unit="RM"
              />
              <InfoCard
                title="Recommended System"
                value={String(savings.recommendedKWp)}
                unit="kWp"
              />
              <InfoCard
                title="Panels Needed"
                value={String(savings.panelsForRecommendedKWp)}
                unit="panels"
              />
            </div>
            <NearbyCompanies
              companies={nearbyCompanies}
              isLoading={isLoadingCompanies}
              handleRequestQuotation={handleRequestQuotation}
              submittedQuotations={submittedQuotations}
            />
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
const StepIndicator = ({ currentStep, totalSteps, steps }) => (
  <div className="mb-12">
    <Progress value={(currentStep / totalSteps) * 100} className="h-2 mb-6" />
    <div className="flex justify-between items-center">
      {steps.map((s, index) => (
        <div
          key={index}
          className={`flex flex-col items-center ${
            index < currentStep ? "text-green-500" : "text-gray-400"
          }`}
        >
          <div
            className={`rounded-full p-3 ${
              index < currentStep ? "bg-green-100" : "bg-gray-100"
            }`}
          >
            {s.icon}
          </div>
          <span className="text-sm mt-2 font-medium">{s.title}</span>
        </div>
      ))}
    </div>
  </div>
);

const SavingsCard = ({ title, oldValue, newValue, value, unit }) => (
  <Card className="border-0 overflow-hidden">
    <CardContent className="p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-500">{title}</h3>
      {oldValue && newValue ? (
        <div className="flex justify-between items-baseline">
          <span className="text-gray-500 line-through text-lg">
            {unit}
            {oldValue}
          </span>
          <span className="text-3xl font-bold text-green-500">
            {unit}
            {newValue}
          </span>
        </div>
      ) : (
        <span className="text-3xl font-bold text-green-500">
          {unit}
          {value}
        </span>
      )}
    </CardContent>
  </Card>
);

const InfoCard = ({ title, value, unit }) => (
  <Card className="border-0 overflow-hidden">
    <CardContent className="p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-500">{title}</h3>
      <span className="text-3xl font-bold text-blue-600">
        {value} <span className="text-lg text-gray-500">{unit}</span>
      </span>
    </CardContent>
  </Card>
);

const NearbyCompanies = ({
  companies,
  isLoading,
  handleRequestQuotation,
  submittedQuotations,
}) => (
  <>
    <h3 className="text-2xl font-semibold mb-8">
      Suggested Nearby Solar Companies
    </h3>
    {isLoading ? (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    ) : companies.length > 0 ? (
      <ul className="space-y-8">
        {companies.map((company, index) => (
          <motion.li
            key={company.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="rounded-lg shadow-md border overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                <h4 className="text-xl font-semibold mb-2 sm:mb-0">
                  {company.CompanyDetail.companyName}
                </h4>
                <Badge className="text-sm px-3 py-1">
                  {company.distance.toFixed(1)} km
                </Badge>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                  <p className="break-words">{company.CompanyDetail.address}</p>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                  <p>{company.CompanyDetail.phoneNumber}</p>
                </div>
                <div className="flex items-center">
                  <Globe className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
                  <a
                    href={
                      company.CompanyDetail.website.startsWith("http")
                        ? company.CompanyDetail.website
                        : `http://${company.CompanyDetail.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline break-words"
                  >
                    {company.CompanyDetail.website}
                  </a>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row px-6 py-4 gap-3">
              <Button
                className="w-full sm:w-1/2 transition-colors duration-300"
                onClick={() => handleRequestQuotation(company.id)}
                disabled={submittedQuotations.includes(company.id)}
              >
                {submittedQuotations.includes(company.id)
                  ? "Quotation Requested"
                  : "Request Quotation"}
              </Button>
              <a
                href={`/installers/companypublicprofile/${company.id}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:w-1/2"
              >
                <Button
                  variant="outline"
                  className="w-full transition-colors duration-300"
                >
                  View Profile
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </a>
            </div>
          </motion.li>
        ))}
      </ul>
    ) : (
      <p className="text-center py-8 text-gray-600">
        No nearby solar companies found. Please try to reach out to the
        companies directly.
      </p>
    )}
  </>
);

const AuthDialog = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  error,
  activeTab,
  setActiveTab,
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[425px] rounded-lg shadow-xl">
      <DialogHeader>
        <DialogTitle className="text-2xl font-semibold text-gray-500">
          Authentication Required
        </DialogTitle>
        <DialogDescription className="text-gray-500">
          Please log in or register to request a quotation.
        </DialogDescription>
      </DialogHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm onSubmit={onLogin} error={error} />
        </TabsContent>
        <TabsContent value="register">
          <RegisterForm onSubmit={onRegister} error={error} />
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
);

const LoginForm = ({ onSubmit, error }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-500"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 text-gray-900 bg-gray-100 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-500"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 text-gray-900 bg-gray-100 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" className="w-full transition-colors duration-300">
        Login
      </Button>
    </form>
  );
};

const RegisterForm = ({ onSubmit, error }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(username, email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-500"
        >
          Username
        </label>
        <input
          type="text"
          id="username"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 text-gray-900 bg-gray-100 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-500"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 text-gray-900 bg-gray-100 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-500"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          placeholder="Choose a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 text-gray-900 bg-gray-100 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" className="w-full transition-colors duration-300">
        Register
      </Button>
    </form>
  );
};

AuthDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired,
  error: PropTypes.string,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

NearbyCompanies.propTypes = {
  companies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      CompanyDetail: PropTypes.shape({
        companyName: PropTypes.string.isRequired,
        address: PropTypes.string.isRequired,
        phoneNumber: PropTypes.string.isRequired,
        website: PropTypes.string.isRequired,
      }).isRequired,
      distance: PropTypes.number.isRequired,
    })
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  handleRequestQuotation: PropTypes.func.isRequired,
  submittedQuotations: PropTypes.arrayOf(PropTypes.number).isRequired,
};

StepIndicator.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      icon: PropTypes.element.isRequired,
    })
  ).isRequired,
};

InfoCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
};

SavingsCard.propTypes = {
  title: PropTypes.string.isRequired,
  oldValue: PropTypes.string,
  newValue: PropTypes.string,
  value: PropTypes.string,
  unit: PropTypes.string.isRequired,
};

RegisterForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.string,
};

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default SolarEstimation;
