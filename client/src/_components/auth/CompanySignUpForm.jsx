import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { AlertCircle } from "lucide-react";
import { loadGoogleMaps } from "../../utils/googleMaps";

const CompanySignUpForm = () => {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [businessLicense, setBusinessLicense] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const addressInputRef = useRef(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  useEffect(() => {
    loadGoogleMaps(() => {
      if (window.google && window.google.maps) {
        setIsGoogleMapsLoaded(true);
      }
    });
  }, []);

  useEffect(() => {
    if (isGoogleMapsLoaded && addressInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ["address"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          setAddress(place.formatted_address);
        }
      });
    }
  }, [isGoogleMapsLoaded]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("companyName", companyName);
    formData.append("email", email);
    formData.append("phoneNumber", phoneNumber);
    formData.append("address", address);
    formData.append("website", website);
    formData.append("registrationNumber", registrationNumber);
    if (businessLicense) {
      formData.append("businessLicense", businessLicense);
    }

    try {
      await axios.post(
        "http://localhost:5000/api/auth/register-company",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSuccess("Application submitted successfully. Please allow 3-5 business days for approval.");
      setError("");
      setIsSubmitted(true);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError(error.response.data.message);
      } else {
        setError("An error occurred");
      }
      setSuccess("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 shadow-lg rounded-lg mt-10 mb-10 border">
      <h2 className="text-3xl font-bold mb-16 text-center">Company Application</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1">
          <Label htmlFor="companyName">Company Name</Label>
          <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="mt-1" />
        </div>

        <div className="col-span-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" />
        </div>

        <div className="col-span-1">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required className="mt-1" />
        </div>

        <div className="col-span-1">
          <Label htmlFor="address">Address</Label>
          <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} ref={addressInputRef} required className="mt-1" />
        </div>

        <div className="col-span-1">
          <Label htmlFor="website">Website</Label>
          <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} required className="mt-1" />
        </div>

        <div className="col-span-1">
          <Label htmlFor="registrationNumber">Registration Number</Label>
          <Input id="registrationNumber" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} required className="mt-1" />
        </div>

        <div className="col-span-1">
          <Label htmlFor="businessLicense">Business License</Label>
          <Input id="businessLicense" type="file" onChange={(e) => setBusinessLicense(e.target.files[0])} required className="mt-1" />
        </div>

        <div className="col-span-1 md:col-span-2">
          <Button type="submit" className="w-full mt-4" disabled={isSubmitted || !isGoogleMapsLoaded}>
            {isGoogleMapsLoaded ? "Submit Application" : "Loading..."}
          </Button>
        </div>

        {error && (
          <div className="col-span-1 md:col-span-2 flex items-center space-x-2 border border-red-500 bg-red-100 text-red-700 p-2 rounded-md">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="col-span-1 md:col-span-2 flex items-center space-x-2 border border-green-500 bg-green-100 text-green-700 p-2 rounded-md">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{success}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default CompanySignUpForm;
