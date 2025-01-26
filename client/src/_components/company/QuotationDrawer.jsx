import { useState, useEffect, useRef } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { X, Check, Send } from "lucide-react";
import { motion } from "framer-motion";
import { loadGoogleMaps } from "../../utils/googleMaps"; // Ensure this utility is available

const QuotationDrawer = ({
  isDrawerOpen,
  setIsDrawerOpen,
  companyId,
  BASE_URL,
}) => {
  const [formData, setFormData] = useState({
    salutation: "",
    name: "",
    email: "",
    phoneNumber: "",
    electricityBill: "",
    propertyType: "",
    address: "",
    state: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [quotationError, setQuotationError] = useState(null);
  const [quotationSuccess, setQuotationSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (isDrawerOpen) {
      if (!window.google) {
        loadGoogleMaps(() => {
          initializeAutocomplete();
        });
      } else {
        initializeAutocomplete();
      }
      fetchUserDetails();
    }
    setTimeout(() => (document.body.style.pointerEvents = ""), 0);
  }, [isDrawerOpen]);

  const initializeAutocomplete = () => {
    if (addressInputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          types: ["address"],
        }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        if (place.formatted_address) {
          setFormData((prevData) => ({
            ...prevData,
            address: place.formatted_address,
          }));
        }
      });
    }
  };

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/consumer/profile`, {
        withCredentials: true,
      });
      const { user, consumerProfile } = response.data;
      setFormData((prevData) => ({
        ...prevData,
        name: user.username || "",
        email: user.email || "",
        phoneNumber: consumerProfile?.phoneNumber || "",
        address: consumerProfile?.address || "",
      }));
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.salutation) errors.salutation = "Salutation is required";
    if (!formData.name) errors.name = "Name is required";
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.phoneNumber) errors.phoneNumber = "Phone number is required";
    if (!formData.electricityBill)
      errors.electricityBill = "Electricity bill is required";
    if (!formData.propertyType)
      errors.propertyType = "Property type is required";
    if (!formData.address) errors.address = "Address is required";
    if (!formData.state) errors.state = "State is required";
    return errors;
  };

  const handleSubmitQuotation = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setQuotationError(null);
    setQuotationSuccess(false);

    try {
      await axios.post(
        `${BASE_URL}api/quotation/submit-quotation`,
        {
          ...formData,
          companyId,
        },
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      setQuotationSuccess(true);
      setTimeout(() => {
        setIsDrawerOpen(false);
        setFormData({
          salutation: "",
          name: "",
          email: "",
          phoneNumber: "",
          electricityBill: "",
          propertyType: "",
          address: "",
          state: "",
        });
      }, 2000);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setQuotationError(
        "Failed to submit the quotation request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  return (
    <Drawer
      open={isDrawerOpen}
      onOpenChange={(open) => {
        if (!open) {
          // Only allow closing if not interacting with autocomplete
          const activeElement = document.activeElement;
          if (!activeElement || !activeElement.classList.contains("pac-item")) {
            setIsDrawerOpen(false);
          }
        } else {
          setIsDrawerOpen(true);
        }
      }}
    >
      <DrawerContent
        className="w-full h-screen sm:h-auto sm:max-h-[95vh] sm:rounded-t-xl"
        onPointerDownOutside={(e) => {
          const target = e.target;
          if (target instanceof Element) {
            // Prevent closing when clicking on autocomplete items
            if (target.closest(".pac-container")) {
              e.preventDefault();
            }
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto w-full p-8 overflow-y-auto"
        >
          <DrawerHeader className="mb-8">
            <DrawerTitle className="text-4xl font-bold text-center">
              Request Your Solar Quotation
            </DrawerTitle>
            <p className="text-center text-gray-600 mt-2">
              Get a personalized solar solution for your home
            </p>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                className="absolute right-4 top-4 rounded-full p-2"
              >
                <X className="h-6 w-6 " />
              </Button>
            </DrawerClose>
          </DrawerHeader>
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="col-span-1">
                <div className="flex flex-col">
                  <Select
                    name="salutation"
                    value={formData.salutation}
                    onValueChange={(value) =>
                      handleSelectChange("salutation", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Salutation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr">Mr</SelectItem>
                      <SelectItem value="Mrs">Mrs</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.salutation && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.salutation}
                    </p>
                  )}
                </div>
              </div>
              <div className="col-span-1">
                <div className="flex flex-col">
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    className="w-full"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <Input
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Your Email"
                type="email"
                className="w-full"
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>
            <div className="flex flex-col">
              <Input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Your Phone Number"
                className="w-full"
              />
              {formErrors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.phoneNumber}
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <Input
                name="electricityBill"
                value={formData.electricityBill}
                onChange={handleInputChange}
                placeholder="Average Monthly Electricity Bill (RM)"
                type="number"
                className="w-full"
              />
              {formErrors.electricityBill && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.electricityBill}
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <Input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Your Address"
                className="w-full"
                ref={addressInputRef}
              />
              {formErrors.address && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.address}
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <Select
                name="propertyType"
                value={formData.propertyType}
                onValueChange={(value) =>
                  handleSelectChange("propertyType", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bungalow">Bungalow</SelectItem>
                  <SelectItem value="Semi Detached House">
                    Semi Detached House
                  </SelectItem>
                  <SelectItem value="Terrace/Linked House">
                    Terrace or Linked House
                  </SelectItem>
                </SelectContent>
              </Select>
              {formErrors.propertyType && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.propertyType}
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <Select
                name="state"
                value={formData.state}
                onValueChange={(value) => handleSelectChange("state", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Johor">Johor</SelectItem>
                  <SelectItem value="Kedah">Kedah</SelectItem>
                  <SelectItem value="Kelantan">Kelantan</SelectItem>
                  <SelectItem value="Melaka">Melaka</SelectItem>
                  <SelectItem value="Negeri Sembilan">
                    Negeri Sembilan
                  </SelectItem>
                  <SelectItem value="Pahang">Pahang</SelectItem>
                  <SelectItem value="Perak">Perak</SelectItem>
                  <SelectItem value="Perlis">Perlis</SelectItem>
                  <SelectItem value="Pulau Pinang">Pulau Pinang</SelectItem>
                  <SelectItem value="Sabah">Sabah</SelectItem>
                  <SelectItem value="Sarawak">Sarawak</SelectItem>
                  <SelectItem value="Selangor">Selangor</SelectItem>
                  <SelectItem value="Terengganu">Terengganu</SelectItem>
                  <SelectItem value="Wilayah Persekutuan Kuala Lumpur">
                    Kuala Lumpur
                  </SelectItem>
                  <SelectItem value="Wilayah Persekutuan Labuan">
                    Labuan
                  </SelectItem>
                  <SelectItem value="Putrajaya">Putrajaya</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.state && (
                <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>
              )}
            </div>
          </form>
          {quotationError && (
            <Alert variant="destructive" className="mt-6">
              <AlertDescription>{quotationError}</AlertDescription>
            </Alert>
          )}
          {quotationSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Alert
                variant="default"
                className="mt-6 bg-green-100 border-green-300 text-green-800"
              >
                <AlertDescription className="flex font-medium mr-2">
                  <Check className="h-5 w-5 flex justify-center items-center mr-2" />
                  Quotation request submitted successfully!
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          <DrawerFooter className="mt-8">
            <Button
              variant="default"
              onClick={handleSubmitQuotation}
              disabled={isSubmitting}
              className="w-full font-semibold py-4 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg flex items-center bg-primary justify-center"
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <svg
                    className="animate-spin h-5 w-5 mr-3"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </motion.div>
              ) : (
                <Send className="h-5 w-5 mr-2" />
              )}
              {isSubmitting ? "Submitting..." : "Get Your Solar Quotation"}
            </Button>
          </DrawerFooter>
        </motion.div>
      </DrawerContent>
    </Drawer>
  );
};

QuotationDrawer.propTypes = {
  isDrawerOpen: PropTypes.bool.isRequired,
  setIsDrawerOpen: PropTypes.func.isRequired,
  companyId: PropTypes.string.isRequired,
  BASE_URL: PropTypes.string.isRequired,
};

export default QuotationDrawer;