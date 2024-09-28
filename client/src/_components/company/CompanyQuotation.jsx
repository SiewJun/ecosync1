import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { User, FileText, ChevronRight, X, DollarSign } from "lucide-react";
import axios from "axios";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const CompanyQuotation = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const navigate = useNavigate();

  const handleDraftButtonClick = () => {
    const quotationId = selectedQuotation.id;
    navigate(`${quotationId}`);
  };
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
        className="hover:shadow-xl transition-all duration-500 border cursor-pointer overflow-hidden"
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
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${
                quotation.quotationStatus === "PENDING"
                  ? "bg-yellow-100 text-yellow-800 group-hover:bg-yellow-200"
                  : quotation.quotationStatus === "RECEIVED"
                  ? "bg-green-100 text-green-800 group-hover:bg-green-200"
                  : "bg-gray-100 text-gray-800 group-hover:bg-gray-200"
              }`}
            >
              {quotation.quotationStatus}
            </div>
          </div>
          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
            {quotation.consumer?.username || "Unknown Consumer"}
          </h3>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <p>
              Submitted on {new Date(quotation.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
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

      <AnimatePresence>
        {selectedQuotation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black dark:bg-white dark:bg-opacity-25 bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-background rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              <Button
                className="absolute top-4 right-4"
                variant="ghost"
                onClick={closeDetails}
              >
                <X className="h-6 w-6" />
              </Button>
              <div className="p-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-2">
                    {selectedQuotation.consumer?.username}
                  </h2>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedQuotation.quotationStatus === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedQuotation.quotationStatus === "RECEIVED"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedQuotation.quotationStatus}
                  </div>
                </div>

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
                  <Button
                    variant="default"
                    onClick={handleDraftButtonClick}
                  >
                    Draft Quotation
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompanyQuotation;
