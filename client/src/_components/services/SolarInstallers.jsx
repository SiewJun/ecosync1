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
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const SolarInstallers = ({ companies }) => {
  const [userRole, setUserRole] = useState(null);
  const BASE_URL = "http://localhost:5000/";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setUserRole(null);
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
      const token = localStorage.getItem("token");
      // eslint-disable-next-line no-unused-vars
      const response = await axios.post(
        `${BASE_URL}api/communication/chats/initiate`,
        { companyId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate(`/consumer-dashboard/chat/${companyId}`);
    } catch (error) {
      console.error("Failed to initiate chat", error);
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-240px)] sm:h-[calc(100vh-280px)]">
      <div className="space-y-3">
        {companies.length ? (
          companies.map((company, index) => (
            <Accordion
              key={index}
              type="single"
              collapsible
              className="rounded-md overflow-hidden shadow-sm"
            >
              <AccordionItem value={`item-${index}`}>
                <AccordionTrigger className="px-3 py-2 hover:no-underline mb-4">
                  <div className="flex flex-row items-center space-x-3 w-full">
                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                      {company.avatarUrl ? (
                        <AvatarImage
                          src={`${BASE_URL}${company.avatarUrl}`}
                          alt={company.CompanyDetail.companyName}
                        />
                      ) : (
                        <AvatarFallback>
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 text-left">
                      <h4 className="text-sm sm:text-base font-semibold">
                        {company.CompanyDetail.companyName}
                      </h4>
                      <p className="text-xs line-clamp-1">
                        {company.CompanyProfile.overview}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {company.CompanyDetail.businessLicense && (
                        <Badge
                          variant="secondary"
                          className="flex items-center space-x-1 px-1 py-0 text-[10px]"
                        >
                          <ShieldCheck className="w-2 h-2" />
                          <span>Pre-screened</span>
                        </Badge>
                      )}
                      {company.CompanyProfile.certificate && (
                        <Badge
                          variant="outline"
                          className="flex items-center space-x-1 px-1 py-0 text-[10px]"
                        >
                          <CheckCircle className="w-2 h-2" />
                          <span>Certified</span>
                        </Badge>
                      )}
                      <div className="flex space-x-2 mt-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant={userRole === "CONSUMER" ? "default" : "outline"}
                                className="transition-all duration-300 ease-in-out transform hover:scale-105"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (userRole === "CONSUMER") {
                                    handleChatClick(company.id);
                                  } else if (userRole !== "ADMIN" && userRole !== "COMPANY") {
                                    window.location.href = "/signin";
                                  }
                                }}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">
                                {userRole === "CONSUMER"
                                  ? "Start a conversation"
                                  : "Create an account to start conversations with installers"}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="transition-all duration-300 ease-in-out transform hover:scale-105"
                                asChild
                              >
                                <Link
                                  to={`/companypublicprofile/${company.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">See detailed company information</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 py-2 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold mb-2">
                        Contact Information
                      </h3>
                      <div className="space-y-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-full justify-start text-xs py-1">
                                <Phone className="mr-1 h-3 w-3" />{" "}
                                {company.CompanyDetail.phoneNumber}
                              </div>
                            </TooltipTrigger>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-full justify-start text-xs py-1">
                                <Globe className="mr-1 h-3 w-3" />{" "}
                                {company.CompanyDetail.website
                                  ? `${company.CompanyDetail.website}`
                                  : "Website"}
                              </div>
                            </TooltipTrigger>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-full justify-start text-xs py-1">
                                <MapPin className="mr-1 h-3 w-3" />{" "}
                                {company.CompanyDetail.address
                                  ? `${company.CompanyDetail.address}`
                                  : "Address"}
                              </div>
                            </TooltipTrigger>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold mb-2">
                        Services
                      </h3>
                      <p className="text-xs">
                        {company.CompanyProfile.services}
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))
        ) : (
          <p className="text-center py-4 text-sm">No solar installers found.</p>
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
