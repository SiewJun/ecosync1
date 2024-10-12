import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  User,
  FileText,
  ChevronRight,
  DollarSign,
  Clock,
  AlertTriangle,
  ThumbsUp,
  Loader2,
} from "lucide-react";
import axios from "axios";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CompanyQuotation = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/quotation/company-quotations",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setQuotations(response.data.quotations);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Failed to load quotations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotations();
  }, []);

  const handleQuotationClick = (quotation) => {
    setSelectedQuotation(quotation);
  };

  const closeDetails = () => {
    setSelectedQuotation(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 group-hover:bg-yellow-200";
      case "RECEIVED":
        return "bg-green-100 text-green-800 group-hover:bg-green-200";
      case "FINALIZED":
        return "bg-blue-100 text-blue-800 group-hover:bg-blue-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 group-hover:bg-red-200";
      case "ACCEPTED":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-gray-100 text-gray-800 group-hover:bg-gray-200";
    }
  };

  const QuotationCard = ({ quotation }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="group"
    >
      <Card
        className={`hover:shadow-xl transition-all duration-500 border cursor-pointer overflow-hidden ${
          quotation.quotationStatus === "REJECTED" ? "opacity-60" : ""
        }`}
        onClick={() => handleQuotationClick(quotation)}
      >
        <CardContent className="p-6 relative">
          <div className="absolute top-0 left-0 w-full h-1 group-hover:scale-x-100 transition-transform duration-300"></div>
          <div className="flex items-center justify-between mb-4">
            <Avatar className="w-16 h-16 ring-2 ring-offset-2 ring-primary">
              {quotation.consumer?.ConsumerProfile?.avatarUrl ? (
                <AvatarImage
                  src={`http://localhost:5000/${quotation.consumer.ConsumerProfile.avatarUrl}`}
                  alt={quotation.consumer.username}
                />
              ) : (
                <AvatarFallback>
                  <User className="h-8 w-8 text-gray-400" />
                </AvatarFallback>
              )}
            </Avatar>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${getStatusColor(
                quotation.quotationStatus
              )}`}
            >
              {quotation.quotationStatus}
            </div>
          </div>
          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
            {quotation.consumer?.username || "Unknown Consumer"}
          </h3>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Clock className="h-4 w-4 mr-2" />
            <p>
              Submitted on {new Date(quotation.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-sm font-medium text-gray-500">
                Avg. Monthly: RM{quotation.averageMonthlyElectricityBill}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-primary group-hover:transform group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  QuotationCard.propTypes = {
    quotation: PropTypes.shape({
      consumer: PropTypes.shape({
        ConsumerProfile: PropTypes.shape({
          avatarUrl: PropTypes.string,
          phoneNumber: PropTypes.string,
        }),
        username: PropTypes.string,
      }),
      quotationStatus: PropTypes.string,
      createdAt: PropTypes.string,
      averageMonthlyElectricityBill: PropTypes.string,
    }).isRequired,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
        <Button
          className="mt-8 bg-red-600 hover:bg-red-700 text-white"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen container p-6">
      <div className="max-w-5xl mx-auto">
        <ScrollArea className="h-[calc(100vh-250px)]">
          <AnimatePresence>
            {quotations.length ? (
              <motion.div
                layout
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {quotations.map((quotation) => (
                  <QuotationCard key={quotation.id} quotation={quotation} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-muted">
                  <CardContent className="flex flex-col items-center justify-center h-32">
                    <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-center text-sm text-muted-foreground">
                      No quotations available.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </div>

      <Dialog open={!!selectedQuotation} onOpenChange={closeDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Quotation Details</DialogTitle>
            <DialogDescription>
              View the details of your solar quotation.
            </DialogDescription>
          </DialogHeader>
          {selectedQuotation && (
            <ScrollArea className="mt-4 max-h-[60vh]">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedQuotation.consumer?.username || "Unknown Consumer"}
                    </h3>
                    <p>Quotation ID: {selectedQuotation.id}</p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedQuotation.quotationStatus
                    )}`}
                  >
                    {selectedQuotation.quotationStatus}
                  </div>
                </div>

                {selectedQuotation.quotationStatus === "REJECTED" && (
                  <div className="mb-8 p-4 bg-red-100 border border-red-300 rounded-md">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      <p className="text-red-700 font-medium">
                        This quotation has been rejected by the consumer.
                      </p>
                    </div>
                  </div>
                )}

                {selectedQuotation.quotationStatus === "ACCEPTED" && (
                  <div className="mb-8 p-4 bg-primary border border-primary rounded-md">
                    <div className="flex items-center">
                      <ThumbsUp className="h-5 w-5 text-primary-foreground mr-2" />
                      <p className="text-primary-foreground font-medium">
                        This quotation has been accepted by the consumer. Please
                        proceed with the next steps.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Consumer Information
                    </h3>
                    <div className="space-y-2">
                      <p className="text-gray-500">
                        <span className="font-medium">Name:</span>{" "}
                        {selectedQuotation.salutation} {selectedQuotation.name}
                      </p>
                      <p className="text-gray-500">
                        <span className="font-medium">Email:</span>{" "}
                        {selectedQuotation.email}
                      </p>
                      <p className="text-gray-500">
                        <span className="font-medium">Phone:</span>{" "}
                        {selectedQuotation.phoneNumber}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Property Details
                    </h3>
                    <div className="space-y-2">
                      <p className="text-gray-500">
                        <span className="font-medium">Type:</span>{" "}
                        {selectedQuotation.propertyType}
                      </p>
                      <p className="text-gray-500">
                        <span className="font-medium">Address:</span>{" "}
                        {selectedQuotation.address}
                      </p>
                      <p className="text-gray-500">
                        <span className="font-medium">State:</span>{" "}
                        {selectedQuotation.state}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">
                    Electricity Usage
                  </h3>
                  <div className="bg-gradient-to-r from-secondary to-primary rounded-xl p-6 shadow-inner">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Average Monthly Bill</p>
                        <p className="text-3xl font-bold text-primary">
                          RM{selectedQuotation.averageMonthlyElectricityBill}
                        </p>
                      </div>
                      <div className="text-primary-foreground opacity-50">
                        <DollarSign className="h-12 w-12" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex justify-end space-x-4">
                  <Button
                    className="bg-black text-white dark:bg-white dark:text-gray-700 hover:bg-gray-800 dark:hover:bg-gray-200"
                    onClick={closeDetails}
                  >
                    Close
                  </Button>
                  {(selectedQuotation.quotationStatus === "PENDING" ||
                    selectedQuotation.quotationStatus === "RECEIVED") && (
                    <Button
                      variant="default"
                      onClick={() => navigate(`${selectedQuotation.id}`)}
                    >
                      Draft Quotation
                    </Button>
                  )}

                  {(selectedQuotation.quotationStatus === "ACCEPTED" ||
                    selectedQuotation.quotationStatus === "FINALIZED") && (
                    <Button
                      variant="default"
                      onClick={() => navigate(`${selectedQuotation.id}`)}
                    >
                      View Quotation
                    </Button>
                  )}

                  {selectedQuotation.quotationStatus === "REJECTED" && (
                    <Button
                      variant="default"
                      disabled
                      className="opacity-50 cursor-not-allowed"
                    >
                      Quotation Rejected
                    </Button>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyQuotation;