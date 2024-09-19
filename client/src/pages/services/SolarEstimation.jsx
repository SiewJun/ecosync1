import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, MapPin, Home, DollarSign, ChevronRight, ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import AddressForm from "@/_components/services/AddressForm";
import MapComponent from "@/_components/services/MapComponent";
import {
  calculatePanels,
  calculateSavings,
} from "@/_components/services/SolarCalculator";
import UserDetailsForm from "@/_components/services/UserDetailsForm";
import { loadGoogleMaps, geocodeAddress } from "@/utils/googleMaps";
import NavBar from "@/_components/nav/NavBar";
import PropTypes from 'prop-types';

const SolarEstimation = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    salutation: '',
    name: '',
    email: '',
    phone: '',
    avgElectricityBill: '',
    address: '',
    propertyType: '',
    state: '',
  });
  const [location, setLocation] = useState(null);
  const [panelCount, setPanelCount] = useState(0);
  const [savings, setSavings] = useState(null);
  const [error, setError] = useState(null);

  const steps = [
    { title: "Your Details", icon: <Sun className="w-6 h-6" /> },
    { title: "Confirm Address", icon: <MapPin className="w-6 h-6" /> },
    { title: "Map Your Roof", icon: <Home className="w-6 h-6" /> },
    { title: "Panel Estimate", icon: <Sun className="w-6 h-6" /> },
    { title: "Solar Savings", icon: <DollarSign className="w-6 h-6" /> },
  ];

  const handleFormSubmit = async (data) => {
    setFormData(data);
    setError(null);

    loadGoogleMaps(async () => {
      try {
        const coordinates = await geocodeAddress(data.address);
        if (coordinates) {
          setLocation(coordinates);
          setStep(2);
        } else {
          throw new Error(
            "Unable to find the address. Please check and try again."
          );
        }
      } catch (error) {
        console.error("Error fetching location:", error);
        setError(
          error.message || "Failed to locate the address. Please try again."
        );
      }
    });
  };

  const handleAddressSelect = (place) => {
    setLocation({
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    });
    setStep(3);
  };

  const handlePolygonComplete = (area) => {
    const panels = calculatePanels(area);
    setPanelCount(panels);
    setStep(4);
  };

  const handleCalculateSavings = () => {
    if (formData) {
      const { avgElectricityBill } = formData;
      const calculatedSavings = calculateSavings(
        avgElectricityBill,
        panelCount
      );
      setSavings(calculatedSavings);
      setStep(5);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <UserDetailsForm onSubmit={handleFormSubmit} initialData={formData} />;
      case 2:
        return (
          <AddressForm onAddressSelect={handleAddressSelect} initialAddress={formData.address} />
        );
      case 3:
        return (
          <MapComponent
            center={location}
            onPolygonComplete={handlePolygonComplete}
          />
        );
      case 4:
        return (
          <div className="text-center">
            <p className="text-2xl font-semibold mb-4">
              Estimated Panels: <span className="text-green-500">{panelCount}</span>
            </p>
            <Button
              onClick={handleCalculateSavings}
              className="w-full max-w-md"
              size="lg"
            >
              Calculate Solar Impact
            </Button>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InfoCard
                title="Recommended System"
                value={savings.recommendedKWp}
                unit="kWp"
              />
              <InfoCard
                title="Panels Needed"
                value={savings.panelsForRecommendedKWp}
                unit="panels"
              />
            </div>
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
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Solar Panel Installation Estimator
        </h1>

        <StepIndicator currentStep={step} totalSteps={steps.length} steps={steps} />

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
          >
            <ChevronLeft className="mr-2" /> Back
          </Button>
          <Button
            onClick={() => setStep((prev) => Math.min(steps.length, prev + 1))}
            disabled={step === steps.length}
          >
            Next <ChevronRight className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// eslint-disable-next-line no-unused-vars
const StepIndicator = ({ currentStep, totalSteps, steps }) => (
  <div className="flex justify-between items-center mb-8">
    {steps.map((s, index) => (
      <div
        key={index}
        className={`flex flex-col items-center ${
          index < currentStep ? "text-green-500" : "text-gray-400"
        }`}
      >
        <div className={`rounded-full p-2 ${
          index < currentStep ? "bg-green-100" : "bg-gray-100"
        }`}>
          {s.icon}
        </div>
        <span className="text-xs mt-1">{s.title}</span>
      </div>
    ))}
  </div>
);

const SavingsCard = ({ title, oldValue, newValue, value, unit }) => (
  <Card>
    <CardContent className="p-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {oldValue && newValue ? (
        <div className="flex justify-between items-baseline">
          <span className="text-gray-500 line-through">{unit}{oldValue}</span>
          <span className="text-2xl font-bold text-green-500">{unit}{newValue}</span>
        </div>
      ) : (
        <span className="text-2xl font-bold text-green-500">{unit}{value}</span>
      )}
    </CardContent>
  </Card>
);

const InfoCard = ({ title, value, unit }) => (
  <Card>
    <CardContent className="p-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <span className="text-2xl font-bold">{value} <span className="text-sm text-gray-500">{unit}</span></span>
    </CardContent>
  </Card>
);

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
  value: PropTypes.number.isRequired,
  unit: PropTypes.string.isRequired,
};

SavingsCard.propTypes = {
  title: PropTypes.string.isRequired,
  oldValue: PropTypes.number,
  newValue: PropTypes.number,
  value: PropTypes.number,
  unit: PropTypes.string.isRequired,
};

export default SolarEstimation;