import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LucideSun, CheckCircle, ShieldCheck, Phone, Globe, MapPin } from "lucide-react";

const SolarInstallers = ({ companies }) => {
  const BASE_URL = "http://localhost:5000/";

  return (
    <ScrollArea className="h-[calc(100vh-240px)] sm:h-[calc(100vh-280px)]">
      <div className="space-y-3">
        {companies.length ? (
          companies.map((company, index) => (
            <Accordion key={index} type="single" collapsible className="rounded-md overflow-hidden shadow-sm ">
              <AccordionItem value={`item-${index}`}>
                <AccordionTrigger className="px-3 py-2 hover:no-underline">
                  <div className="flex flex-row items-center space-x-3 w-full">
                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                      <AvatarImage src={`${BASE_URL}${company.avatarUrl}`} alt={company.CompanyDetail.companyName} />
                      <AvatarFallback>
                        <LucideSun className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <h4 className="text-sm sm:text-base font-semibold">{company.CompanyDetail.companyName}</h4>
                      <p className="text-xs line-clamp-1">{company.CompanyProfile.overview}</p>
                    </div>
                    <div className="flex flex-col space-y-1">
                      {company.CompanyDetail.businessLicense && (
                        <Badge variant="secondary" className="flex items-center space-x-1 px-1 py-0 text-[10px]">
                          <ShieldCheck className="w-2 h-2" />
                          <span>Pre-screened</span>
                        </Badge>
                      )}
                      {company.CompanyProfile.certificate && (
                        <Badge variant="outline" className="flex items-center space-x-1 px-1 py-0 text-[10px]">
                          <CheckCircle className="w-2 h-2" />
                          <span>Certified</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 py-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold mb-2">Contact Information</h3>
                      <div className="space-y-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full justify-start text-xs py-1">
                                <Phone className="mr-1 h-3 w-3" /> {company.CompanyDetail.phoneNumber}
                              </Button>
                            </TooltipTrigger>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full justify-start text-xs py-1">
                                <Globe className="mr-1 h-3 w-3" /> Website
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">{company.CompanyDetail.website}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full justify-start text-xs py-1">
                                <MapPin className="mr-1 h-3 w-3" /> Address
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">{company.CompanyDetail.address}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold mb-2">Services</h3>
                      <p className="text-xs">{company.CompanyProfile.services}</p>
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

export default SolarInstallers;