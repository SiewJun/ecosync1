import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  Phone,
  MapPin,
  FileText,
  Calendar,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import NavBar from "../nav/NavBar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const CompanyPublicProfile = () => {
  const { companyId } = useParams();
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quotationError, setQuotationError] = useState(null);
  const [user, setUser] = useState(null);
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
          // Handle 403 Forbidden error
          localStorage.removeItem("token"); // Optionally remove the token
        } else {
          console.error("Error fetching user:", error);
        }
      }
    };

    fetchUser();
  }, []);

  const handleSubmitQuotation = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          `${BASE_URL}api/quotation/submit-quotation`,
          {
            ...formData,
            companyId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setIsDrawerOpen(false);
        setQuotationError(null);
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setQuotationError(
        "Failed to submit the quotation request. Please try again."
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
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
                  src={`${BASE_URL}${companyData.avatarUrl}`}
                  alt="Company Logo"
                />
                <AvatarFallback>
                  {companyData.CompanyDetail.companyName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-4xl font-bold mb-2">
                  {companyData.CompanyDetail.companyName}
                </h1>
                <p className="text-lg md:text-xl text-gray-600">
                  {companyData.CompanyProfile.overview}
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
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerContent className="w-full p-6">
                <div className="max-w-full mx-auto">
                  <DrawerHeader>
                    <DrawerTitle className="text-2xl font-bold text-primary">
                      Request Quotation
                    </DrawerTitle>
                    <DrawerClose asChild>
                      <Button
                        variant="ghost"
                        className="absolute right-4 top-4"
                      >
                        <X className="h-6 w-6" />
                      </Button>
                    </DrawerClose>
                  </DrawerHeader>
                  <form className="space-y-4">
                    <Input
                      label="Salutation"
                      name="salutation"
                      value={formData.salutation}
                      onChange={handleInputChange}
                      placeholder="Mr/Mrs"
                    />
                    <Input
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your Name"
                    />
                    <Input
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Your Email"
                    />
                    <Input
                      label="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Your Phone Number"
                    />
                    <Input
                      label="Average Monthly Electricity Bill"
                      name="electricityBill"
                      value={formData.electricityBill}
                      onChange={handleInputChange}
                      placeholder="Average Electricity Bill"
                    />
                    <Input
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Your Address"
                    />
                    {/* Dropdown for Property Type */}
                    <Select
                      name="propertyType"
                      value={formData.propertyType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, propertyType: value })
                      }
                    >
                      <SelectTrigger>
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

                    {/* Dropdown for State */}
                    <Select
                      name="state"
                      value={formData.state}
                      onValueChange={(value) =>
                        setFormData({ ...formData, state: value })
                      }
                    >
                      <SelectTrigger>
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
                        <SelectItem value="Penang">Penang</SelectItem>
                        <SelectItem value="Perak">Perak</SelectItem>
                        <SelectItem value="Perlis">Perlis</SelectItem>
                        <SelectItem value="Sabah">Sabah</SelectItem>
                        <SelectItem value="Sarawak">Sarawak</SelectItem>
                        <SelectItem value="Selangor">Selangor</SelectItem>
                      </SelectContent>
                    </Select>
                  </form>
                  {quotationError && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertDescription>{quotationError}</AlertDescription>
                    </Alert>
                  )}
                  <DrawerFooter>
                    <Button
                      variant="default"
                      onClick={handleSubmitQuotation}
                      className="w-full font-semibold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                    >
                      Submit Quotation Request
                    </Button>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>

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
                        {companyData.CompanyDetail.phoneNumber}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <span className="break-words">
                        {companyData.CompanyDetail.address}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <ExternalLink className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <a
                        href={`https://${companyData.CompanyDetail.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {companyData.CompanyDetail.website}
                      </a>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <span>
                        Joined on:{" "}
                        {new Date(
                          companyData.CompanyProfile.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold mb-4">
                      About Us
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      {companyData.CompanyProfile.description}
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
                        data={`${BASE_URL}${companyData.CompanyDetail.businessLicense}`}
                        type="application/pdf"
                        width="100%"
                        height="600px"
                      >
                        <p>
                          Your browser does not support PDFs.{" "}
                          <a
                            href={`${BASE_URL}${companyData.CompanyDetail.businessLicense}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download the PDF
                          </a>
                        </p>
                      </object>
                    </DialogContent>
                  </Dialog>
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
                </div>
              </TabsContent>

              <TabsContent value="services" className="p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-semibold mb-4">
                  Our Services
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {companyData.CompanyProfile.services
                    .split(",")
                    .map((service, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-base md:text-lg py-2 px-4 bg-blue-100 text-blue-800 justify-center"
                      >
                        {service.trim()}
                      </Badge>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="gallery" className="p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-semibold mb-4">
                  Company Gallery
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {companyData.CompanyProfile.CompanyGalleries.map(
                    (gallery) => (
                      <img
                        key={gallery.id}
                        src={`${BASE_URL}${gallery.imageUrl}`}
                        alt="Gallery"
                        className="rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 object-cover h-48 w-full"
                      />
                    )
                  )}
                </div>
              </TabsContent>

              <TabsContent value="solutions" className="p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-semibold mb-4">
                  Solar Solutions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companyData.CompanyProfile.SolarSolutions.map((solution) => (
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
                        <p className="text-gray-600 mb-2">
                          Type: {solution.solarPanelType}
                        </p>
                        <p className="text-gray-600 mb-2">
                          Power Output: {solution.powerOutput}W
                        </p>
                        <p className="text-gray-600 mb-2">
                          Efficiency: {solution.efficiency}%
                        </p>
                        <p className="text-gray-600 mb-2">
                          Warranty: {solution.warranty} years
                        </p>
                        <p className="text-xl font-bold text-green-600 mt-4">
                          ${solution.price}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
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
