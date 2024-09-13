import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Phone, MapPin, FileText, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import NavBar from "../nav/NavBar";

const CompanyPublicProfile = () => {
  const { companyId } = useParams();
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL = "http://localhost:5000/";

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
      <div className="container mx-auto p-6 space-y-6">
        {companyData && (
          <>
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center space-x-4 pb-8">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={companyData.avatarUrl} alt="Company Logo" />
                  <AvatarFallback>
                    {companyData.CompanyDetail.companyName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-3xl font-bold">
                    {companyData.CompanyDetail.companyName}
                  </CardTitle>
                  <p className="text-gray-500">
                    {companyData.CompanyProfile.overview}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span>{companyData.CompanyDetail.phoneNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span>{companyData.CompanyDetail.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="h-5 w-5 text-gray-400" />
                      <a
                        href={`https://${companyData.CompanyDetail.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {companyData.CompanyDetail.website}
                      </a>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span>
                        Business License:{" "}
                        {companyData.CompanyDetail.businessLicense}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span>
                        Joined on:{" "}
                        {new Date(
                          companyData.CompanyProfile.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-xl font-semibold mb-2">About Us</h3>
                  <p className="text-gray-600">
                    {companyData.CompanyProfile.description}
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {companyData.CompanyProfile.services
                      .split(",")
                      .map((service, index) => (
                        <Badge key={index} variant="secondary">
                          {service.trim()}
                        </Badge>
                      ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Certifications</h3>
                  <p className="text-gray-600">
                    {companyData.CompanyProfile.certificate}
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
};

export default CompanyPublicProfile;
