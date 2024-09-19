// SolarEstimation.jsx

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Sun, AlertCircle } from "lucide-react";
import AddressForm from "@/_components/services/AddressForm";
import MapComponent from "@/_components/services/MapComponent";
import {
  calculatePanels,
  calculateSavings,
} from "@/_components/services/SolarCalculator";
import UserDetailsForm from "@/_components/services/UserDetailsForm";

const SolarEstimation = () => {
  const [formData, setFormData] = useState(null);
  const [location, setLocation] = useState(null);
  const [panelCount, setPanelCount] = useState(0);
  const [savings, setSavings] = useState(null);

  const handleFormSubmit = (formData) => {
    setFormData(formData);
  };

  const handleAddressSelect = (place) => {
    setLocation({
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    });
  };

  const handlePolygonComplete = (area) => {
    const panels = calculatePanels(area);
    setPanelCount(panels);
  };

  const handleCalculateSavings = () => {
    if (formData) {
      const { avgElectricityBill } = formData;
      const calculatedSavings = calculateSavings(
        avgElectricityBill,
        panelCount
      );
      setSavings(calculatedSavings);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Solar Panel Installation Estimator
      </h1>
      {!formData ? (
        <UserDetailsForm onSubmit={handleFormSubmit} />
      ) : (
        <div className="space-y-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Thank you, {formData.name}. You can now draw your roof area on the
              map.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Address Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressForm onAddressSelect={handleAddressSelect} />
            </CardContent>
          </Card>

          {location && (
            <Card>
              <CardHeader>
                <CardTitle>Roof Area Mapping</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MapComponent
                  center={location}
                  onPolygonComplete={handlePolygonComplete}
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Estimated Panels: {panelCount}
                  </p>
                  <Button
                    onClick={handleCalculateSavings}
                    disabled={!panelCount}
                  >
                    Calculate Solar Impact
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {savings && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sun className="w-5 h-5" />
                  <span>Solar Bill Estimate</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <p>
                    <strong>Old Monthly Bill:</strong> RM {savings.oldBill}
                  </p>
                  <p>
                    <strong>New Monthly Bill After Solar:</strong> RM{" "}
                    {savings.newBill}
                  </p>
                  <p>
                    <strong>Recommended Solar Installation Size:</strong>{" "}
                    {savings.recommendedKWp} kWp
                  </p>
                  <p>
                    <strong>Panels Needed for Recommended KWp:</strong>{" "}
                    {savings.panelsForRecommendedKWp} panels
                  </p>
                  <p>
                    <strong>Maximum Panels Based on Roof Size:</strong>{" "}
                    {savings.maxPanelCount} panels
                  </p>
                  <p>
                    <strong>Annual Electricity Bill Savings:</strong> RM{" "}
                    {savings.annualSavings}
                  </p>
                  <p>
                    <strong>Percentage Saved:</strong> {savings.percentageSaved}
                    %
                  </p>
                </div>

                <Alert variant={savings.coversFullBill ? "success" : "info"}>
                  <AlertCircle className="h-4 w-4" />
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
        </div>
      )}
    </div>
  );
};

export default SolarEstimation;
