import { useEffect, useState } from "react";
import axios from "axios";
import { Images, Zap, ShieldCheck, Info, Package } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const CompanyProfile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/company/company-profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching company profile:", error);
      }
    };

    fetchProfile();
  }, []);

  if (!profile) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-5xl container mx-auto p-6 space-y-8">
      {/* Company Overview */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2 text-xl font-semibold">
              <Info className="h-6 w-6" />
              Company Overview
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed">
            {profile.description || "Update your company description now."}
          </p>
          <Separator />
          <p className="text-sm leading-relaxed">
            {profile.overview || "Add an overview of your company."}
          </p>
          {profile.certificate ? (
            <div className="flex items-center gap-4 mt-4">
              <ShieldCheck className="h-5 w-5" />
              <a
                href={profile.certificate}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                View Company Certificate
              </a>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="mt-4">
              Upload Certificate
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Services Offered */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2 text-xl font-semibold">
              <Package className="h-6 w-6" />
              Services Offered
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {profile.services ? (
            profile.services.split(",").map((service, index) => (
              <Badge key={index} variant="outline" className="py-2 px-3">
                {service.trim()}
              </Badge>
            ))
          ) : (
            <Button variant="outline" size="sm" className="w-full lg:w-auto">
              Add Services
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Company Galleries */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2 text-xl font-semibold">
              <Images className="h-6 w-6" />
              Company Galleries
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.CompanyGalleries?.length > 0 ? (
            profile.CompanyGalleries.map((gallery, index) => (
              <div key={index}>
                <img
                  src={gallery.imageUrl}
                  alt={`Gallery ${index + 1}`}
                  className="rounded-lg object-cover w-full h-48"
                />
              </div>
            ))
          ) : (
            <p>No galleries available. Add some now.</p>
          )}
        </CardContent>
      </Card>

      {/* Solar Solutions */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2 text-xl font-semibold">
              <Zap className="h-6 w-6" />
              Solar Solutions
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {profile.SolarSolutions?.length > 0 ? (
            profile.SolarSolutions.map((solution, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    {solution.solutionName}
                  </h3>
                  <Badge variant="outline">{solution.solarPanelType}</Badge>
                </div>
                <Separator className="my-2" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <p>
                    <strong>Power Output:</strong> {solution.powerOutput} kW
                  </p>
                  <p>
                    <strong>Efficiency:</strong> {solution.efficiency}%
                  </p>
                  <p>
                    <strong>Warranty:</strong> {solution.warranty} years
                  </p>
                  <p>
                    <strong>Price:</strong> ${solution.price}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <Button variant="outline" size="sm">
              Add Solar Solutions
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyProfile;
