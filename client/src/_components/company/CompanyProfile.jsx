import { useEffect, useState } from "react";
import axios from "axios";
import { Images, Zap, ShieldCheck, Info, MoreHorizontal } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CompanyProfile = () => {
  const [profile, setProfile] = useState(null);
  const BASE_URL = "http://localhost:5000/";

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

  const hasProfileData =
    profile &&
    (profile.description ||
      profile.overview ||
      profile.certificate ||
      profile.services);

  return (
    <>
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
                    <ShieldCheck className="h-5 w-5 text-primary" />
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
                    <Button variant="secondary">Add more galleries</Button>
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
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2 text-xl font-semibold">
                <Zap className="h-6 w-6" />
                Solar Solutions
              </span>
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="mt-5">
            {profile.SolarSolutions?.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Solution Name</TableHead>
                      <TableHead>Panel Type</TableHead>
                      <TableHead>Power Output</TableHead>
                      <TableHead>Efficiency</TableHead>
                      <TableHead>Warranty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profile.SolarSolutions.map((solution, index) => (
                      <TableRow key={index}>
                        {/* Solution Image */}
                        <TableCell>
                          {solution.solutionPic ? (
                            <img
                              src={`${BASE_URL}${solution.solutionPic}`}
                              alt={`Solution ${index + 1}`}
                              className="rounded-lg object-cover w-20 h-20"
                            />
                          ) : (
                            <span className="text-sm italic">No image</span>
                          )}
                        </TableCell>

                        {/* Solution Name */}
                        <TableCell className="font-semibold">
                          {solution.solutionName}
                        </TableCell>

                        {/* Panel Type */}
                        <TableCell>
                          <Badge variant="outline">
                            {solution.solarPanelType}
                          </Badge>
                        </TableCell>

                        {/* Power Output */}
                        <TableCell>{solution.powerOutput} W</TableCell>

                        {/* Efficiency */}
                        <TableCell>{solution.efficiency}%</TableCell>

                        {/* Warranty */}
                        <TableCell>{solution.warranty} years</TableCell>

                        {/* Price */}
                        <TableCell>RM{solution.price}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                //onClick={() => handleReview(app.id, "Approved")}
                              >
                                Update 
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                //onClick={() => handleReview(app.id, "Rejected")}
                                className="text-red-500"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-end mt-4">
                  <Link to="/company-dashboard/company-profile/company-add-solution">
                    <Button variant="secondary" size="sm">
                      Add new solar solutions
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-center items-center h-full">
                <p className="mb-2">No Solar Solutions available.</p>
                <Link to="/company-dashboard/company-profile/company-add-solution">
                  <Button variant="secondary">
                    Add some solar solutions here
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CompanyProfile;
