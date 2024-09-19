import { useState } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Sun, MapPin, Home, DollarSign, AlertTriangle } from "lucide-react";
import AddressForm from "@/_components/services/AddressForm";
import MapComponent from "@/_components/services/MapComponent";
import {
  calculatePanels,
  calculateSavings,
} from "@/_components/services/SolarCalculator";
import UserDetailsForm from "@/_components/services/UserDetailsForm";
import { loadGoogleMaps, geocodeAddress } from "@/utils/googleMaps";
import NavBar from "@/_components/nav/NavBar";

const SolarEstimation = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(null);
  const [location, setLocation] = useState(null);
  const [panelCount, setPanelCount] = useState(0);
  const [savings, setSavings] = useState(null);
  const [error, setError] = useState(null);

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

  const StepIndicator = ({ currentStep, totalSteps }) => (
    <div className="flex justify-center items-center space-x-2 mb-8">
      {[...Array(totalSteps)].map((_, index) => (
        <div
          key={index}
          className={`w-3 h-3 rounded-full ${
            index < currentStep ? "bg-green-500" : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  );

  StepIndicator.propTypes = {
    currentStep: PropTypes.number.isRequired,
    totalSteps: PropTypes.number.isRequired,
  };

  return (
    <>
      <NavBar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
          Solar Panel Installation Estimator
        </h1>

        <StepIndicator currentStep={step} totalSteps={5} />

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
          >
            {step === 1 && <UserDetailsForm onSubmit={handleFormSubmit} />}

            {step === 2 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center">
                    <MapPin className="mr-2" /> Confirm Your Address
                  </h2>
                  <AddressForm onAddressSelect={handleAddressSelect} />
                </CardContent>
              </Card>
            )}

            {step === 3 && location && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center">
                    <Home className="mr-2" /> Map Your Roof
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Draw the outline of your roof on the map below.
                  </p>
                  <MapComponent
                    center={location}
                    onPolygonComplete={handlePolygonComplete}
                  />
                </CardContent>
              </Card>
            )}

            {step === 4 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center">
                    <Sun className="mr-2" /> Solar Panel Estimate
                  </h2>
                  <p className="text-lg mb-4">
                    Estimated Panels: <strong>{panelCount}</strong>
                  </p>
                  <Button
                    onClick={handleCalculateSavings}
                    className="w-full"
                    size="lg"
                  >
                    Calculate Solar Impact
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 5 && savings && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-6 flex items-center">
                    <DollarSign className="mr-2" /> Your Solar Savings
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Old Monthly Bill:</span>
                      <span className="text-xl font-semibold">
                        RM {savings.oldBill}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">New Monthly Bill:</span>
                      <span className="text-xl font-semibold text-green-500">
                        RM {savings.newBill}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Annual Savings:</span>
                      <span className="text-xl font-semibold text-green-500">
                        RM {savings.annualSavings}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Percentage Saved:</span>
                      <span className="text-xl font-semibold">
                        {savings.percentageSaved}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Recommended kWp:</span>
                      <span className="text-xl font-semibold">
                        {savings.recommendedKWp} kWp
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Panels for Recommended kWp:
                      </span>
                      <span className="text-xl font-semibold">
                        {savings.panelsForRecommendedKWp}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Max Panel Count:</span>
                      <span className="text-xl font-semibold">
                        {savings.maxPanelCount}
                      </span>
                    </div>
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
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default SolarEstimation;