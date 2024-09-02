import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";

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
      await axios.post("http://localhost:5000/api/auth/register-company", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess("Application submitted successfully");
      setError("");
    } catch (error) {
      setError(error.response.data.message || "An error occurred");
      setSuccess("");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4">Company Application</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          id="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />

        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />

        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          required
        />

        <Label htmlFor="registrationNumber">Registration Number</Label>
        <Input
          id="registrationNumber"
          value={registrationNumber}
          onChange={(e) => setRegistrationNumber(e.target.value)}
          required
        />

        <Label htmlFor="businessLicense">Business License</Label>
        <Input
          id="businessLicense"
          type="file"
          onChange={(e) => setBusinessLicense(e.target.files[0])}
          required
        />

        <Button type="submit" className="w-full mt-4">Submit Application</Button>
        
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-500 mt-2">{success}</p>}
      </form>
    </div>
  );
};

export default CompanySignUpForm;
