import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeftCircle,
  Sun,
  Battery,
  DollarSign,
  Clock,
  Percent,
  Shield,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import PropTypes from 'prop-types';

const ConsumerQuotationView = () => {
  const { versionId } = useParams();
  const [quotationDetails, setQuotationDetails] = useState(null);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);

  useEffect(() => {
    const fetchQuotationDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/quotation/consumer-quotations/${versionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setQuotationDetails(response.data);
      } catch (err) {
        setError(
          err.response
            ? err.response.data.message
            : "Error fetching quotation details"
        );
      }
    };

    fetchQuotationDetails();
  }, [versionId]);

  const handleAcceptQuotation = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/quotation/accept/${quotationDetails.quotationId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const response = await axios.get(
        `http://localhost:5000/api/quotation/consumer-quotations/${versionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setQuotationDetails(response.data);
      toast({
        title: "Quotation Accepted",
        description: "Your quotation has been successfully accepted.",
        duration: 5000,
      });
    } catch (err) {
      setError(
        err.response ? err.response.data.message : "Error accepting quotation"
      );
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!quotationDetails) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  const {
    systemSize,
    panelSpecifications,
    costBreakdown,
    estimatedEnergyProduction,
    savings,
    paybackPeriod,
    roi,
    incentives,
    productWarranties,
    timeline,
    versionNumber,
    status,
    createdAt,
    quotation,
  } = quotationDetails;

  const {
    company,
    salutation,
    name,
    email,
    phoneNumber,
    averageMonthlyElectricityBill,
    propertyType,
    address,
    state,
    quotationStatus,
  } = quotation;

  const canAccept =
    (quotationStatus === "RECEIVED" || quotationStatus === "FINALIZED") &&
    (status === "DRAFT" || status === "FINALIZED");

  const isAccepted = quotationStatus === "ACCEPTED";

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <Link
        to="/consumer-dashboard/consumer-quotation"
        className="inline-flex items-center text-primary hover:text-black dark:hover:text-white mb-8"
      >
        <ArrowLeftCircle className="mr-2" size={16} />
        Back to Quotations
      </Link>
      <Toaster />
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Solar System Quotation
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Version {versionNumber} - {status}
                </p>
              </div>
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={`http://localhost:5000/${company.avatarUrl}`}
                  alt={company.CompanyDetail.companyName}
                />
                <AvatarFallback>
                  {company.CompanyDetail.companyName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-8">
            {/* Accepted Alert */}
            {isAccepted && (
              <Alert className="bg-gradient-to-r from-green-50 to-emerald-50">
                <AlertTitle className="font-semibold">Quotation Accepted</AlertTitle>
                <AlertDescription>
                  You have accepted this quotation. The company will be notified
                  and will contact you soon to discuss the next steps in the
                  installation process.
                </AlertDescription>
              </Alert>
            )}

            {/* Accept Button */}
            {canAccept && (
              <div className="flex justify-end">
                <Button onClick={() => setIsAcceptDialogOpen(true)}>
                  Accept Quotation
                </Button>
              </div>
            )}

            {/* Accept Confirmation Dialog */}
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
                    This action cannot be undone. Accepting the quotation will
                    finalize the process with this company.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleAcceptQuotation}>
                    Accept Quotation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Client and Company Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-lg">
              <DetailSection title="Client Details">
                <p className="mb-1">
                  <span className="font-semibold">{salutation} {name}</span>
                </p>
                <p className="mb-1">{email}</p>
                <p className="mb-1">{phoneNumber}</p>
                <p className="mb-1">{address}</p>
                <p className="mb-1">{state}</p>
                <p>{propertyType}</p>
              </DetailSection>
              <DetailSection title="Company Details">
                <p className="mb-1">
                  <span className="font-semibold">{company.CompanyDetail.companyName}</span>
                </p>
                <p className="mb-1">{company.CompanyDetail.phoneNumber}</p>
                <p>{company.CompanyDetail.website}</p>
              </DetailSection>
            </div>

            {/* System Specifications and Energy Production */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-lg border border-gray-200">
              <DetailSection
                title="System Specifications"
                icon={<Sun size={18} />}
              >
                <p className="mb-2">
                  <span className="font-semibold">System Size:</span> {systemSize}
                </p>
                <p>
                  <span className="font-semibold">Panel Specifications:</span> {panelSpecifications}
                </p>
              </DetailSection>
              <DetailSection
                title="Energy Production"
                icon={<Battery size={18} />}
              >
                <p className="mb-2">
                  <span className="font-semibold">Estimated Production:</span> {estimatedEnergyProduction}
                </p>
                <p>
                  <span className="font-semibold">Current Avg. Monthly Bill:</span> RM{averageMonthlyElectricityBill}
                </p>
              </DetailSection>
            </div>

            {/* Financial Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-50 p-6 rounded-lg">
              <DetailSection
                title="Financial Benefits"
                icon={<DollarSign size={18} />}
              >
                <p className="mb-2">
                  <span className="font-semibold">Savings:</span> {savings}
                </p>
                <p>
                  <span className="font-semibold">ROI:</span> {roi}
                </p>
              </DetailSection>
              <DetailSection title="Payback Period" icon={<Clock size={18} />}>
                <p>{paybackPeriod}</p>
              </DetailSection>
              <DetailSection title="Incentives" icon={<Percent size={18} />}>
                <p>{incentives}</p>
              </DetailSection>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <DetailSection
                title="Cost Breakdown"
                icon={<DollarSign size={18} />}
              >
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Item</TableHead>
                        <TableHead className="font-semibold">Quantity</TableHead>
                        <TableHead className="font-semibold">Unit Price</TableHead>
                        <TableHead className="font-semibold">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {costBreakdown.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.item}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>RM{item.unitPrice}</TableCell>
                          <TableCell>RM{item.totalPrice}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </DetailSection>
            </div>

            {/* Warranties and Project Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-lg">
              <DetailSection title="Warranties" icon={<Shield size={18} />}>
                <p>{productWarranties}</p>
              </DetailSection>
              <DetailSection
                title="Project Timeline"
                icon={<Calendar size={18} />}
              >
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Phase</TableHead>
                        <TableHead className="font-semibold">Start Date</TableHead>
                        <TableHead className="font-semibold">End Date</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeline.map((phase, index) => (
                        <TableRow key={index}>
                          <TableCell>{phase.phase}</TableCell>
                          <TableCell>
                            {new Date(phase.startDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(phase.endDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{phase.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </DetailSection>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center text-sm text-gray-500 pt-6 mt-8 border-t border-gray-200">
              <p>
                Quotation created on: {new Date(createdAt).toLocaleDateString()}
              </p>
              <div className="flex items-center">
                <CheckCircle className="mr-2" size={16} />
                <span>{status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailSection = ({ title, children, icon }) => (
  <div>
    <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      {title}
    </h3>
    <div className="text-gray-600">{children}</div>
  </div>
);

DetailSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  icon: PropTypes.element,
};

export default ConsumerQuotationView;
