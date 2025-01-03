import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Building2,
  FileText,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  DollarSign,
  Calendar,
  CheckIcon,
  Clock,
  AlertTriangle,
  ThumbsUp,
} from "lucide-react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ConsumerQuotation = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/quotation/consumer-quotations",
          {
            withCredentials: true, // Include credentials in the request
          }
        );
        setQuotations(response.data.quotations);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setQuotations([]);
        } else {
          setError("Failed to load quotations. Please try again later.");
        }
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = quotations.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleRejectQuotation = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/quotation/reject/${selectedQuotation.id}`,
        {},
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      setQuotations(
        quotations.map((q) =>
          q.id === selectedQuotation.id
            ? { ...q, quotationStatus: "REJECTED" }
            : q
        )
      );
      setSelectedQuotation({
        ...selectedQuotation,
        quotationStatus: "REJECTED",
      });
      toast({
        title: "Quotation Rejected",
        description: "The quotation has been successfully rejected.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error rejecting quotation:", error);
      toast({
        title: "Error",
        description: "Failed to reject the quotation. Please try again.",
        variant: "destructive",
      });
    }
    setIsRejectDialogOpen(false);
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
          <div className="flex items-center justify-between mb-4">
            <Avatar className="w-16 h-16 ring-2 ring-offset-2 ring-primary">
              {quotation.company?.avatarUrl ? (
                <AvatarImage
                  src={`http://localhost:5000/${quotation.company.avatarUrl}`}
                  alt={quotation.company?.CompanyDetail?.companyName}
                />
              ) : (
                <AvatarFallback>
                  <Building2 className="h-8 w-8 text-gray-400" />
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
          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
            {quotation.company?.CompanyDetail?.companyName || "Unknown Company"}
          </h3>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Calendar className="h-4 w-4 mr-2" />
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
      id: PropTypes.string.isRequired,
      company: PropTypes.shape({
        avatarUrl: PropTypes.string,
        CompanyDetail: PropTypes.shape({
          companyName: PropTypes.string,
        }),
      }),
      quotationStatus: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      averageMonthlyElectricityBill: PropTypes.string.isRequired,
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

  const handleAcceptQuotation = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/quotation/accept/${selectedQuotation.id}`,
        {},
        {
          withCredentials: true, // Include credentials in the request
        }
      );
      setQuotations(
        quotations.map((q) =>
          q.id === selectedQuotation.id
            ? { ...q, quotationStatus: "ACCEPTED" }
            : q
        )
      );
      setSelectedQuotation({
        ...selectedQuotation,
        quotationStatus: "ACCEPTED",
      });
      toast({
        title: "Quotation Accepted",
        description: "The quotation has been successfully accepted.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error accepting quotation:", error);
      toast({
        title: "Error",
        description: "Failed to accept the quotation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen container p-6">
      <div className="max-w-5xl mx-auto">
        <Toaster />
        <AnimatePresence>
          {quotations.length ? (
            <motion.div
              layout
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {currentItems.map((quotation) => (
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

        {quotations.length > itemsPerPage && (
          <div className="flex justify-center mt-8 space-x-2">
            <Button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              variant="default"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {[...Array(Math.ceil(quotations.length / itemsPerPage)).keys()].map(
              (number) => (
                <Button
                  key={number + 1}
                  onClick={() => paginate(number + 1)}
                  className={`${
                    currentPage === number + 1
                      ? "bg-primary text-white"
                      : "bg-white text-primary"
                  } hover:bg-blue-100`}
                >
                  {number + 1}
                </Button>
              )
            )}
            <Button
              onClick={() => paginate(currentPage + 1)}
              disabled={
                currentPage === Math.ceil(quotations.length / itemsPerPage)
              }
              variant="default"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Detailed View Dialog */}
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
                      {selectedQuotation.company?.CompanyDetail?.companyName ||
                        "Unknown Company"}
                    </h3>
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
                        You have rejected this quotation and further actions
                        cannot be taken on it.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Contact Information
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
                      <DollarSign className="h-12 w-12 text-primary-foreground opacity-50" />
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">
                    Quotation Timeline
                  </h3>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <ul className="space-y-6 relative">
                      <li className="ml-6">
                        <div className="flex items-center">
                          <div className="absolute left-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Clock className="h-4 w-4 text-white" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium">
                              Quotation Submitted
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(
                                selectedQuotation.createdAt
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </li>
                      {selectedQuotation.quotationStatus === "RECEIVED" && (
                        <li className="ml-6">
                          <div className="flex items-center">
                            <div className="absolute left-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckIcon className="h-4 w-4 text-white" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium">
                                Quotation Received
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(
                                  selectedQuotation.updatedAt
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </li>
                      )}
                      {selectedQuotation.quotationStatus === "FINALIZED" && (
                        <li className="ml-6">
                          <div className="flex items-center">
                            <div className="absolute left-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <FileText className="h-4 w-4 text-white" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium">
                                Quotation Finalized
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(
                                  selectedQuotation.updatedAt
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </li>
                      )}
                      {selectedQuotation.quotationStatus === "ACCEPTED" && (
                        <li className="ml-6">
                          <div className="flex items-center">
                            <div className="absolute left-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <ThumbsUp className="h-4 w-4 text-white" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium">
                                Quotation Accepted
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(
                                  selectedQuotation.updatedAt
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="mt-12">
                  <h3 className="text-xl font-semibold mb-4">Next Steps</h3>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm">
                    {selectedQuotation.quotationStatus === "PENDING" && (
                      <p className="text-gray-700">
                        The company is currently reviewing your quotation
                        request. Please wait for them to process your
                        information and provide a detailed quote.
                      </p>
                    )}
                    {selectedQuotation.quotationStatus === "RECEIVED" && (
                      <p className="text-gray-700">
                        Your quotation request has been replied by the company.
                        They will work closely with you to finalize the
                        quotation.
                      </p>
                    )}
                    {selectedQuotation.quotationStatus === "FINALIZED" && (
                      <p className="text-gray-700">
                        Great news! Your quotation has been finalized. Please
                        review the details carefully. If everything looks good,
                        you can proceed with accepting the quote or contact the
                        company for any clarifications.
                      </p>
                    )}
                    {selectedQuotation.quotationStatus === "ACCEPTED" && (
                      <div className="mb-8 p-4 bg-primary border border-priamry rounded-md">
                        <div className="flex items-center">
                          <ThumbsUp className="h-5 w-5 text-primary-foreground mr-2" />
                          <p className="text-primary-foreground font-medium">
                            You have accepted this quotation. The company will
                            be in touch with you shortly to proceed with the
                            next steps.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          <div className="mt-6 flex-col justify-end space-x-2 space-y-2">
            <Button variant="outline" onClick={closeDetails}>
              Close
            </Button>
            <Button
              variant="default"
              disabled={selectedQuotation?.quotationStatus === "PENDING"}
              onClick={() => {
                if (
                  selectedQuotation?.versions &&
                  selectedQuotation.versions.length > 0
                ) {
                  navigate(
                    `/consumer-dashboard/consumer-quotation/${selectedQuotation.id}/submitted-versions`
                  );
                }
              }}
            >
              {selectedQuotation?.quotationStatus === "FINALIZED" ||
              selectedQuotation?.quotationStatus === "ACCEPTED"
                ? "Review Quotation"
                : "View Quotation"}
            </Button>
            {selectedQuotation?.quotationStatus !== "REJECTED" &&
              selectedQuotation?.quotationStatus !== "ACCEPTED" &&
              !selectedQuotation?.project && (
                <Button
                  variant="destructive"
                  onClick={() => setIsRejectDialogOpen(true)}
                  disabled={selectedQuotation?.quotationStatus === "PENDING"}
                >
                  Reject Quotation
                </Button>
              )}
            {selectedQuotation?.quotationStatus === "FINALIZED" && (
              <Button
                variant="outline"
                onClick={() => setIsAcceptDialogOpen(true)}
              >
                Accept Quotation
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Quotation Confirmation Dialog */}
      <AlertDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to reject this quotation?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Rejecting the quotation will end the
              process with this company.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectQuotation}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2"
            >
              Reject Quotation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isAcceptDialogOpen}
        onOpenChange={setIsAcceptDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to accept this quotation?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Accepting the quotation will proceed with the process with this
              company.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAcceptQuotation}
              className="bg-primary text-primary-foreground font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2"
            >
              Accept Quotation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConsumerQuotation;
