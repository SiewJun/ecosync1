import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
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

const ConsumerQuotationView = () => {
  const { versionId } = useParams();
  const [quotationDetails, setQuotationDetails] = useState(null);
  const [error, setError] = useState(null);
  
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
  } = quotation;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <Link
        to="/consumer-dashboard/consumer-quotation"
        className="inline-flex items-center text-primary hover:text-black mb-8"
      >
        <ArrowLeftCircle className="mr-2" size={16} />
        Back to Quotations
      </Link>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Solar System Quotation</h1>
                <p className="text-sm text-gray-500 mt-1">Version {versionNumber} - {status}</p>
              </div>
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={`http://localhost:5000/${company.avatarUrl}`}
                  alt={company.CompanyDetail.companyName}
                />
                <AvatarFallback>{company.CompanyDetail.companyName.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-8">
            {/* Client and Company Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DetailSection title="Client Details">
                <p>{salutation} {name}</p>
                <p>{email}</p>
                <p>{phoneNumber}</p>
                <p>{address}</p>
                <p>{state}</p>
                <p>{propertyType}</p>
              </DetailSection>
              <DetailSection title="Company Details">
                <p>{company.CompanyDetail.companyName}</p>
                <p>{company.CompanyDetail.phoneNumber}</p>
                <p>{company.CompanyDetail.website}</p>
              </DetailSection>
            </div>

            {/* System Specifications and Energy Production */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DetailSection title="System Specifications" icon={<Sun size={18} />}>
                <p>System Size: {systemSize}</p>
                <p>Panel Specifications: {panelSpecifications}</p>
              </DetailSection>
              <DetailSection title="Energy Production" icon={<Battery size={18} />}>
                <p>Estimated Production: {estimatedEnergyProduction}</p>
                <p>Current Avg. Monthly Bill: RM{averageMonthlyElectricityBill}</p>
              </DetailSection>
            </div>

            {/* Financial Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <DetailSection title="Financial Benefits" icon={<DollarSign size={18} />}>
                <p>Savings: {savings}</p>
                <p>ROI: {roi}</p>
              </DetailSection>
              <DetailSection title="Payback Period" icon={<Clock size={18} />}>
                <p>{paybackPeriod}</p>
              </DetailSection>
              <DetailSection title="Incentives" icon={<Percent size={18} />}>
                <p>{incentives}</p>
              </DetailSection>
            </div>

            {/* Cost Breakdown */}
            <DetailSection title="Cost Breakdown" icon={<DollarSign size={18} />}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
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
            </DetailSection>

            {/* Warranties and Project Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DetailSection title="Warranties" icon={<Shield size={18} />}>
                <p>{productWarranties}</p>
              </DetailSection>
              <DetailSection title="Project Timeline" icon={<Calendar size={18} />}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phase</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeline.map((phase, index) => (
                      <TableRow key={index}>
                        <TableCell>{phase.phase}</TableCell>
                        <TableCell>{new Date(phase.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(phase.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>{phase.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DetailSection>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-200">
              <p>Quotation created on: {new Date(createdAt).toLocaleDateString()}</p>
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
    <h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
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