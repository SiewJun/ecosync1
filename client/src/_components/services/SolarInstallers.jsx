import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Building2,
  CheckCircle,
  ShieldCheck,
  Phone,
  Globe,
  MapPin,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const SolarInstallers = ({ companies }) => {
  const [userRole, setUserRole] = useState(null);
  const BASE_URL = "http://localhost:5000/";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/auth/me`, {
          withCredentials: true, // Include credentials in the request
        });
        setUserRole(response.data.user.role);
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setUserRole(null);
      }
    };
  
    fetchUserRole();
  }, []);
  
  const handleChatClick = async (companyId) => {
    try {
      await axios.post(
        `${BASE_URL}api/communication/chats/initiate`,
        { companyId },
        {
          withCredentials: true, // Include credentials in the request
        }
      );
  
      navigate(`/consumer-dashboard/chat/${companyId}`);
    } catch (error) {
      console.error("Failed to initiate chat", error);
    }
  };
  
  return (
<ScrollArea className="h-[calc(100vh-120px)] sm:h-[calc(100vh-160px)]">      <div className="space-y-6 p-4 sm:p-6 md:p-8">
        {companies.length ? (
          companies.map((company, index) => (
            <Accordion
              key={index}
              type="single"
              collapsible
              className="rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 hover:shadow-md"
            >
              <AccordionItem value={`item-${index}`} className="border-none">
                <AccordionTrigger className="px-4 sm:px-6 py-6 hover:no-underline group">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full">
                    <Avatar className="w-20 h-20 rounded-xl border-2">
                      {company.avatarUrl ? (
                        <AvatarImage
                          src={`${BASE_URL}${company.avatarUrl}`}
                          alt={company.CompanyDetail.companyName}
                          className="object-cover"
                        />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600">
                          <Building2 className="h-10 w-10 text-white" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 text-left">
                      <h4 className="text-xl font-semibold mb-1 group-hover:text-primary transition-colors duration-300">
                        {company.CompanyDetail.companyName}
                      </h4>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                        {company.CompanyProfile.overview}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {company.CompanyDetail.businessLicense && (
                          <Badge
                            variant="secondary"
                            className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                          >
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            <span>Pre-screened</span>
                          </Badge>
                        )}
                        {company.CompanyProfile.certificate && (
                          <Badge
                            variant="outline"
                            className="flex items-center space-x-1 px-2 py-1 text-xs border-green-300 text-green-600 rounded-full"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            <span>Certified</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end space-x-2 sm:space-x-0 sm:space-y-2 ml-auto">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {userRole !== "ADMIN" && userRole !== "COMPANY" && (
                              <div
                                className={`transition-all duration-300 ease-in-out rounded-lg border-2 transform hover:scale-105 ${
                                  userRole === "CONSUMER"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-secondary-foreground"
                                } p-2 inline-flex items-center cursor-pointer`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (userRole === "CONSUMER") {
                                    handleChatClick(company.id);
                                  } else if (
                                    userRole !== "ADMIN" &&
                                    userRole !== "COMPANY"
                                  ) {
                                    navigate("/signin");
                                  }
                                }}
                              >
                                <MessageSquare className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Chat</span>
                              </div>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {userRole === "CONSUMER"
                                ? "Start a conversation"
                                : "Create an account to chat with installers"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="transition-all duration-300 ease-in-out transform hover:scale-105 rounded-lg border-2 p-2 inline-flex items-center cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Link
                                to={`/installers/companypublicprofile/${company.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center"
                              >
                                <ExternalLink className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">
                                  Profile
                                </span>
                              </Link>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              View detailed company profile
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-6 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-500 mb-3">
                        Contact Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm p-3 rounded-lg shadow-sm">
                          <Phone className="mr-3 h-5 w-5 text-primary" />
                          <span className="font-medium">
                            {company.CompanyDetail.phoneNumber}
                          </span>
                        </div>
                        <div className="flex items-center text-sm p-3 rounded-lg shadow-sm">
                          <Globe className="mr-3 h-5 w-5 text-primary" />
                          <span className="font-medium">
                            {company.CompanyDetail.website ||
                              "Website not provided"}
                          </span>
                        </div>
                        <div className="flex items-center text-sm p-3 rounded-lg shadow-sm">
                          <MapPin className="mr-3 h-5 w-5 text-primary" />
                          <span className="font-medium">
                            {company.CompanyDetail.address ||
                              "Address not provided"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-500 font-semibold mb-3">
                        Services
                      </h3>
                      <div className="p-4 rounded-lg shadow-sm">
                        <p className="text-sm">
                          {company.CompanyProfile.services ||
                            "No services listed"}
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-16 w-16 mb-4" />
            <p className="text-xl font-semibold mb-2">
              No solar installers found
            </p>
            <p className="text-sm text-gray-600">
              We could not find any solar installers matching your criteria. Try
              adjusting your search or check back later.
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

SolarInstallers.propTypes = {
  companies: PropTypes.arrayOf(
    PropTypes.shape({
      avatarUrl: PropTypes.string,
      CompanyDetail: PropTypes.shape({
        companyName: PropTypes.string.isRequired,
        phoneNumber: PropTypes.string,
        website: PropTypes.string,
        address: PropTypes.string,
        businessLicense: PropTypes.oneOfType([
          PropTypes.bool,
          PropTypes.string,
        ]),
      }).isRequired,
      CompanyProfile: PropTypes.shape({
        overview: PropTypes.string,
        certificate: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
        services: PropTypes.string,
      }).isRequired,
    })
  ).isRequired,
};

export default SolarInstallers;