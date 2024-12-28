import { useState } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Globe, ArrowRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const ITEMS_PER_PAGE = 3;

const NearbyCompanies = ({ companies, isLoading, handleRequestQuotation, submittedQuotations }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(companies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentCompanies = companies.slice(startIndex, endIndex);

  return (
    <div className="space-y-8">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-48 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Finding solar installers near you...</p>
        </div>
      ) : companies.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="wait">
              {currentCompanies.map((company, index) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Company Avatar and Basic Info */}
                        <div className="flex items-start gap-4">
                          <Avatar className="h-20 w-20 rounded-lg border-2">
                            <AvatarImage 
                              src={`http://localhost:5000/${company.avatarUrl}`} 
                              alt={company.CompanyDetail.companyName}
                              className="object-cover"
                            />
                            <AvatarFallback className="text-xl">
                              {company.CompanyDetail.companyName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="text-xl font-semibold">{company.CompanyDetail.companyName}</h4>
                            <Badge variant="secondary" className="text-sm">
                              {company.distance.toFixed(1)} km away
                            </Badge>
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div className="flex-1 grid grid-cols-1 gap-4 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                            <span className="break-words">{company.CompanyDetail.address}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span>{company.CompanyDetail.phoneNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <a
                                href={company.CompanyDetail.website.startsWith("http") ? company.CompanyDetail.website : `http://${company.CompanyDetail.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline truncate"
                              >
                                {company.CompanyDetail.website}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <Button
                          className="flex-1"
                          variant={submittedQuotations.includes(company.id) ? "outline" : "default"}
                          onClick={() => handleRequestQuotation(company.id)}
                          disabled={submittedQuotations.includes(company.id)}
                        >
                          {submittedQuotations.includes(company.id) ? (
                            "Quote Requested ✓"
                          ) : (
                            "Request Quote"
                          )}
                        </Button>
                        <Button variant="outline" className="flex-1" asChild>
                          <a
                            href={`/installers/companypublicprofile/${company.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Profile <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentPage} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 space-y-2">
          <p className="text-lg font-medium">No Solar Installers Found</p>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t find any solar installers in your area. Please try expanding your search or contact support for assistance.
          </p>
        </div>
      )}
    </div>
  );
};

NearbyCompanies.propTypes = {
  companies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      avatarUrl: PropTypes.string,
      CompanyDetail: PropTypes.shape({
        companyName: PropTypes.string.isRequired,
        address: PropTypes.string.isRequired,
        phoneNumber: PropTypes.string.isRequired,
        website: PropTypes.string.isRequired,
      }).isRequired,
      distance: PropTypes.number.isRequired,
    })
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  handleRequestQuotation: PropTypes.func.isRequired,
  submittedQuotations: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default NearbyCompanies;