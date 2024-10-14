import { useEffect, useState } from "react";
import axios from "axios";
import { Images, ShieldCheck, Info, Loader2 } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import SolarSolutionsSection from "./SolarSolutionsSection";

const CompanyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const BASE_URL = "http://localhost:5000/";
  const navigate = useNavigate();

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
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>No profile data available.</p>
      </div>
    );
  }

  const onDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}api/company/delete-solar-solution/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      window.location.reload(); // Reload the page after successful deletion
    } catch (error) {
      console.error("Failed to delete solutions", error);
    }
  };

  const hasProfileData =
    profile &&
    (profile.description ||
      profile.overview ||
      profile.certificate ||
      profile.services);

  return (
      <div className="max-w-5xl container mx-auto p-6 space-y-8">
        {/* Company Overview */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2 text-xl font-semibold">
                <Info className="h-6 w-6" />
                Company Overview
              </span>
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent
            className={`space-y-4 mt-5 ${
              !hasProfileData ? "flex justify-center items-center h-full" : ""
            }`}
          >
            {hasProfileData ? (
              <>
                <p className="text-sm leading-relaxed">
                  {profile.description
                    ? `Company description: ${profile.description}`
                    : "Update your company description"}
                </p>
                <p className="text-sm leading-relaxed">
                  {profile.overview
                    ? `Company overview: ${profile.overview}`
                    : "Update your company overview now."}
                </p>
                <p className="text-sm leading-relaxed">
                  {profile.services
                    ? `Services: ${profile.services}`
                    : "No services stated. Update your services now."}
                </p>
                {profile.certificate ? (
                  <div className="flex items-center gap-4 mt-4">
                    <ShieldCheck className="h-5 w-5 text-blue-500" />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="link"
                          className="text-blue-500 hover:underline p-0"
                        >
                          View Certificate
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogTitle>Certificate</DialogTitle>
                        <object
                          data={`${BASE_URL}${profile.certificate}`}
                          type="application/pdf"
                          width="100%"
                          height="500px"
                        >
                          <p>
                            Your browser does not support this document.{" "}
                            <a
                              href={`${BASE_URL}${profile.certificate}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="link">Download the PDF</Button>
                            </a>
                          </p>
                        </object>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 mt-4">
                    <ShieldCheck className="h-5 w-5 text-gray-400" />
                    <span>
                      Upload a certificate to build more trust with customers
                    </span>
                  </div>
                )}
                <Separator />
                <Link to="/company-dashboard/company-profile/company-profile-edit">
                  <Button variant="secondary" className="mt-4">
                    Update your company profile
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/company-dashboard/company-profile/company-profile-edit">
                <Button variant="secondary">
                  Upload your company profile here
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Company Galleries */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2 text-xl font-semibold">
                <Images className="h-6 w-6" />
                Company Galleries
              </span>
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {profile.CompanyGalleries?.length > 0 ? (
              <>
                {profile.CompanyGalleries.map((gallery, index) => (
                  <div key={index}>
                    <Dialog>
                      <DialogTrigger asChild>
                        <img
                          src={`${BASE_URL}${gallery.imageUrl}`}
                          alt={`Gallery ${index + 1}`}
                          className="rounded-lg object-cover w-full h-48 cursor-pointer"
                        />
                      </DialogTrigger>
                      <DialogContent>
                        <DialogTitle>Gallery Image {index + 1}</DialogTitle>
                        <img
                          src={`${BASE_URL}${gallery.imageUrl}`}
                          alt={`Gallery ${index + 1}`}
                          className="rounded-lg object-cover w-full"
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
                <div className="flex justify-center items-center">
                  <Link to="/company-dashboard/company-profile/company-gallery-edit">
                    <Button variant="secondary">Add/Edit galleries</Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="block">
                  <p className="mb-2">No galleries available.</p>
                  <Link to="/company-dashboard/company-profile/company-gallery-edit">
                    <Button variant="secondary">Add some now</Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Solar Solutions */}
        <SolarSolutionsSection
          profile={{
            ...profile,
            SolarSolutions: profile.SolarSolutions.map((solution) => ({
              ...solution,
              id: solution.id.toString(),
              powerOutput: solution.powerOutput.toString(),
              efficiency: solution.efficiency.toString(),
              warranty: solution.warranty.toString(),
              price: solution.price.toString(),
            })),
          }}
          BASE_URL={BASE_URL}
          onDelete={onDelete}
          navigate={navigate}
        />
      </div>
  );
};

export default CompanyProfile;