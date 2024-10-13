import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeftCircle, Asterisk } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

const CompanyProfileEditForm = () => {
  const [profileData, setProfileData] = useState({
    description: "",
    overview: "",
    services: "",
  });
  const [certificate, setCertificate] = useState(null); // State for the certificate file
  const [error, setError] = useState(null); // Error state
  const [success, setSuccess] = useState(null); // Success state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/company/company-profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfileData({
          description: response.data.description || "",
          overview: response.data.overview || "",
          services: response.data.services || "",
        });
      } catch (error) {
        console.error("Error fetching profile", error);
        setError("Failed to fetch company profile.");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setCertificate(e.target.files[0]); // Set the selected file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("description", profileData.description);
      formData.append("overview", profileData.overview);
      formData.append("services", profileData.services);
      if (certificate) {
        formData.append("certificate", certificate); // Append the certificate file
      }

      await axios.put(
        "http://localhost:5000/api/company/update-company-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSuccess("Profile updated successfully!");
      navigate("/company-dashboard/company-profile");
    } catch (error) {
      console.error("Error updating profile", error);
      setError("Failed to update profile. Please try again.");
    }
  };

  return (
    <>
      <ScrollArea className="h-screen">
        <div className="p-6">
          <Link
            to="/company-dashboard/company-profile"
            className="inline-flex items-center text-primary hover:text-black dark:hover:text-white mb-8"
          >
            <ArrowLeftCircle className="mr-2" size={16} />
            Back to profile
          </Link>
          <div className="flex justify-center items-center">
            <Card className="shadow-lg rounded-lg overflow-hidden w-full max-w-3xl">
              <CardHeader className="p-4">
                <CardTitle className="text-xl font-bold">
                  Edit Company Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium"
                    >
                      Description
                    </label>
                    <Textarea
                      id="description"
                      name="description"
                      value={profileData.description}
                      onChange={handleChange}
                      placeholder="Company Description"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-500 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="overview" className="block text-sm font-medium">
                      Overview
                    </label>
                    <Textarea
                      id="overview"
                      name="overview"
                      value={profileData.overview}
                      onChange={handleChange}
                      placeholder="Company Overview"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-500 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="certificate"
                      className="block text-sm font-medium"
                    >
                      Certificate
                    </label>
                    <Input
                      id="certificate"
                      type="file"
                      name="certificate"
                      onChange={handleFileChange} // Use handleFileChange to set the file
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-500 focus:ring-opacity-50"
                    />
                    <div className="flex mt-2 items-center">
                      <p className="flex items-center text-sm text-slate-400">
                        <Asterisk className="w-3 h-3"/>
                        Add a certificate to build trust with consumers
                      </p>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="services" className="block text-sm font-medium">
                      Services
                    </label>
                    <Input
                      id="services"
                      type="text"
                      name="services"
                      value={profileData.services}
                      onChange={handleChange}
                      placeholder="Services"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring focus:ring-gray-500 focus:ring-opacity-50"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Save Changes
                  </Button>

                  {/* Feedback Messages */}
                  {error && (
                    <div className="flex items-center space-x-2 border border-red-500 bg-red-100 p-2 rounded-md mt-2">
                      <AlertCircle className="h-5 w-5" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="flex items-center space-x-2 border border-green-500 bg-green-100 text-green-700 p-2 rounded-md mt-2">
                      <AlertCircle className="h-5 w-5" />
                      <p className="text-sm">{success}</p>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </>
  );
};

export default CompanyProfileEditForm;