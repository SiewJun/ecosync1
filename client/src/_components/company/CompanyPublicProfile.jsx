import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import NavBar from "../nav/NavBar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuotationDrawer from "./QuotationDrawer";

const CompanyPublicProfile = () => {
  const { companyId } = useParams();
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const BASE_URL = "http://localhost:5000/";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}api/companypublic/company/${companyId}`
        );
        setCompanyData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching company profile", err);
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, [companyId]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.get(
            "http://localhost:5000/api/auth/me",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setUser(response.data.user);
        }
      } catch (error) {
        if (error.response && error.response.status === 403) {
          localStorage.removeItem("token");
        } else {
          console.error("Error fetching user:", error);
        }
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {companyData && (
          <>
            <header className="rounded-xl shadow-sm p-4 md:p-8 flex flex-col md:flex-row items-center md:space-x-8 space-y-4 md:space-y-0">
              <Avatar className="h-24 w-24 md:h-32 md:w-32">
                <AvatarImage
                  src={`${BASE_URL}${companyData.avatarUrl || ""}`}
                  alt="Company Logo"
                />
                <AvatarFallback>
                  {companyData.CompanyDetail?.companyName?.[0] || "C"}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-4xl font-bold mb-2">
                  {companyData.CompanyDetail?.companyName || "Company Name"}
                </h1>
                <p className="text-lg md:text-xl text-gray-500">
                  {companyData.CompanyProfile?.overview ||
                    "Overview not available"}
                </p>
              </div>
            </header>
            {user ? (
              user.role === "CONSUMER" ? (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="default"
                    onClick={() => setIsDrawerOpen(true)}
                    className="font-semibold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                  >
                    Request Quotation
                  </Button>
                </div>
              ) : null
            ) : (
              <div className="flex justify-center mt-4">
                <Button
                  variant="default"
                  onClick={() => navigate("/signin")}
                  className="font-semibold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                >
                  Request Quotation
                </Button>
              </div>
            )}
            <QuotationDrawer
              isDrawerOpen={isDrawerOpen}
              setIsDrawerOpen={setIsDrawerOpen}
              companyId={companyId}
              BASE_URL={BASE_URL}
            />{" "}
            <Tabs defaultValue="about" className="rounded-xl shadow-sm">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="solutions">Solutions</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-4">
                    <h2 className="text-xl md:text-2xl font-semibold mb-4">
                      Company Details
                    </h2>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <span className="break-all">
                        {companyData.CompanyDetail?.phoneNumber || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <span className="break-words">
                        {companyData.CompanyDetail?.address || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <ExternalLink className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <a
                        href={`https://${
                          companyData.CompanyDetail?.website || ""
                        }`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {companyData.CompanyDetail?.website || "N/A"}
                      </a>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <span>
                        Joined on:{" "}
                        {companyData.CompanyProfile?.createdAt
                          ? new Date(
                              companyData.CompanyProfile.createdAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold mb-4">
                      About Us
                    </h2>
                    <p className="text-gray-500 leading-relaxed">
                      {companyData.CompanyProfile?.description ||
                        "Description not available"}
                    </p>
                  </div>
                </div>
                <Separator className="my-6" />
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto flex items-center justify-center space-x-2"
                      >
                        <FileText className="h-5 w-5" />
                        <span>View Business License</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-full max-w-3xl">
                      <DialogTitle>Business License</DialogTitle>
                      <object
                        data={`${BASE_URL}${
                          companyData.CompanyDetail?.businessLicense || ""
                        }`}
                        type="application/pdf"
                        width="100%"
                        height="600px"
                      >
                        <p>
                          Your browser does not support PDFs.{" "}
                          <a
                            className="underline text-blue-500"
                            href={`${BASE_URL}${
                              companyData.CompanyDetail?.businessLicense || ""
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download the PDF
                          </a>
                        </p>
                      </object>
                    </DialogContent>
                  </Dialog>
                  {companyData.CompanyProfile?.certificate ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto flex items-center justify-center space-x-2"
                        >
                          <FileText className="h-5 w-5" />
                          <span>View Certifications</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-full max-w-3xl">
                        <DialogTitle>Certifications</DialogTitle>
                        <object
                          data={`${BASE_URL}${companyData.CompanyProfile.certificate}`}
                          type="application/pdf"
                          width="100%"
                          height="600px"
                        >
                          <p>
                            Your browser does not support PDFs.{" "}
                            <a
                              className="underline text-blue-500"
                              href={`${BASE_URL}${companyData.CompanyProfile.certificate}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Download the PDF
                            </a>
                          </p>
                        </object>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <p>No certifications provided.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="services" className="p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-semibold mb-4">
                  Our Services
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {companyData.CompanyProfile?.services
                    ? companyData.CompanyProfile.services
                        .split(",")
                        .map((service, index) => (
                          <div
                            key={index}
                            className="text-base md:text-lg py-2 px-4 bg-blue-100 text-blue-800 rounded-md shadow-sm break-words text-center"
                          >
                            {service.trim()}
                          </div>
                        ))
                    : "No services available"}
                </div>
              </TabsContent>

              <TabsContent value="gallery" className="p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-semibold mb-4">
                  Company Gallery
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {companyData.CompanyProfile?.CompanyGalleries?.length > 0
                    ? companyData.CompanyProfile.CompanyGalleries.map(
                        (gallery, index) => (
                          <Dialog key={gallery.id}>
                            <DialogTrigger asChild>
                              <img
                                src={`${BASE_URL}${gallery.imageUrl}`}
                                alt={`Gallery ${index + 1}`}
                                className="rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 object-cover h-48 w-full cursor-pointer"
                              />
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[720px]">
                              <DialogTitle>
                                Gallery Image {index + 1}
                              </DialogTitle>
                              <img
                                src={`${BASE_URL}${gallery.imageUrl}`}
                                alt={`Gallery ${index + 1}`}
                                className="rounded-lg object-cover w-full"
                              />
                            </DialogContent>
                          </Dialog>
                        )
                      )
                    : "No gallery images available"}
                </div>
              </TabsContent>

              <TabsContent value="solutions" className="p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-semibold mb-4">
                  Solar Solutions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companyData.CompanyProfile?.SolarSolutions?.length > 0
                    ? companyData.CompanyProfile.SolarSolutions.map(
                        (solution) => (
                          <Card key={solution.id} className="overflow-hidden">
                            <img
                              src={`${BASE_URL}${solution.solutionPic}`}
                              alt={solution.solutionName}
                              className="w-full h-48 object-cover"
                            />
                            <CardContent className="p-4">
                              <h3 className="text-lg md:text-xl font-semibold mb-2">
                                {solution.solutionName}
                              </h3>
                              <p className="text-gray-500 mb-2">
                                Type: {solution.solarPanelType}
                              </p>
                              <p className="text-gray-500 mb-2">
                                Power Output: {solution.powerOutput}W
                              </p>
                              <p className="text-gray-500 mb-2">
                                Efficiency: {solution.efficiency}%
                              </p>
                              <p className="text-gray-500 mb-2">
                                Warranty: {solution.warranty} years
                              </p>
                              <p className="text-xl font-bold opacity-50 mt-4">
                                RM{solution.price}
                              </p>
                            </CardContent>
                          </Card>
                        )
                      )
                    : "No solar solutions available"}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </>
  );
};

export default CompanyPublicProfile;
