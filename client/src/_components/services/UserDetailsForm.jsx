import { useState, useEffect, useRef, forwardRef } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Home, DollarSign } from "lucide-react";
import { loadGoogleMaps, geocodeAddress } from "@/utils/googleMaps";

const InputWithIcon = forwardRef(({ icon: Icon, ...props }, ref) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
    <Input {...props} ref={ref} className="pl-10 w-full focus:ring-2 focus:ring-primary" />
  </div>
));

InputWithIcon.displayName = "InputWithIcon";

const UserDetailsForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState(initialData);
  const [addressCoordinates, setAddressCoordinates] = useState(null);
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    loadGoogleMaps(() => {
      if (window.google && addressInputRef.current) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          addressInputRef.current,
          {
            componentRestrictions: { country: "MY" },
            fields: ["address_components", "formatted_address", "geometry"],
          }
        );
        autocompleteRef.current.addListener("place_changed", handlePlaceSelect);
      }
    });
  }, []);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      const address = place.formatted_address;
      const state = place.address_components.find(
        (component) => component.types.includes("administrative_area_level_1")
      )?.long_name || "";

      setFormData((prev) => ({ ...prev, address, state }));
      setAddressCoordinates({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!addressCoordinates) {
      try {
        const coordinates = await geocodeAddress(formData.address);
        if (coordinates) {
          setAddressCoordinates(coordinates);
          onSubmit(formData, coordinates);
        } else {
          throw new Error("Unable to geocode the address");
        }
      } catch (error) {
        console.error("Error geocoding address:", error);
      }
    } else {
      onSubmit(formData, addressCoordinates);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-sm rounded-xl overflow-hidden">
      <CardContent className="p-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-500">Personal Details</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Select
              value={formData.salutation}
              onValueChange={(value) => handleChange("salutation", value)}
              required
            >
              <SelectTrigger className="w-full focus:ring-2 focus:ring-primary">
                <SelectValue placeholder="Salutation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mr">Mr.</SelectItem>
                <SelectItem value="Mrs">Mrs.</SelectItem>
                <SelectItem value="Ms">Ms.</SelectItem>
                <SelectItem value="Dr">Dr.</SelectItem>
              </SelectContent>
            </Select>
            <InputWithIcon
              icon={User}
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>
          <InputWithIcon
            icon={Mail}
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
          <InputWithIcon
            icon={Phone}
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            required
          />
          <InputWithIcon
            icon={DollarSign}
            type="number"
            placeholder="Average Monthly Electricity Bill (RM)"
            value={formData.avgElectricityBill}
            onChange={(e) => handleChange("avgElectricityBill", e.target.value)}
            required
          />
          <InputWithIcon
            icon={Home}
            placeholder="Start typing your address"
            ref={addressInputRef}
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-6">
            <Select
              value={formData.propertyType}
              onValueChange={(value) => handleChange("propertyType", value)}
              required
            >
              <SelectTrigger className="w-full focus:ring-2 focus:ring-primary">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bungalow">Bungalow</SelectItem>
                <SelectItem value="semi-detached">Semi Detached</SelectItem>
                <SelectItem value="terrace">Terrace/Linked House</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={formData.state}
              onValueChange={(value) => handleChange("state", value)}
              required
            >
              <SelectTrigger className="w-full focus:ring-2 focus:ring-primary">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {["Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Perak", "Perlis", "Pulau Pinang", "Sabah", "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Labuan", "Putrajaya"].map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              className="w-full bg-primary font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out"
            >
              Submit and Continue
            </Button>
          </motion.div>
        </form>
      </CardContent>
    </Card>
  );
};

UserDetailsForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    salutation: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    avgElectricityBill: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    address: PropTypes.string,
    propertyType: PropTypes.string,
    state: PropTypes.string,
  }).isRequired,
};

InputWithIcon.propTypes = {
  icon: PropTypes.elementType.isRequired,
};

export default UserDetailsForm;