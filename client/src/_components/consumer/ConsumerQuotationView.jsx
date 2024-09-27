import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeftCircle, Sun, Battery, DollarSign, Clock, Percent, Shield, Calendar, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
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
    quotation
  } = quotationDetails;

  const { company, salutation, name, email, phoneNumber, averageMonthlyElectricityBill, propertyType, address, state } = quotation;

  return (
    <div className="min-h-screen p-8">
      <Link to="/consumer-dashboard/consumer-quotation" className="inline-flex items-center text-primary hover:text-secondary mb-8">
          <ArrowLeftCircle className="mr-2" size={16} />
          Back to Quotations
        </Link>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Solar System Quotation</h1>
              <p className="text-sm text-gray-500 mt-1">Version {versionNumber} - {status}</p>
            </div>
            <Avatar className="h-16 w-16">
              <AvatarImage src={`http://localhost:5000/${company.avatarUrl}`} alt={company.CompanyDetail.companyName} />
              <AvatarFallback>{company.CompanyDetail.companyName.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>

          <Separator className="my-8" />

          <div className="grid grid-cols-2 gap-x-16 gap-y-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Client Details</h3>
              <p className="text-gray-600">{salutation} {name}</p>
              <p className="text-gray-600">{email}</p>
              <p className="text-gray-600">{phoneNumber}</p>
              <p className="text-gray-600">{address}</p>
              <p className="text-gray-600">{state}</p>
              <p className="text-gray-600">{propertyType}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Company Details</h3>
              <p className="text-gray-600">{company.CompanyDetail.companyName}</p>
              <p className="text-gray-600">{company.CompanyDetail.phoneNumber}</p>
              <p className="text-gray-600">{company.CompanyDetail.website}</p>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="grid grid-cols-2 gap-x-16 gap-y-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
                <Sun className="mr-2" size={18} />
                System Specifications
              </h3>
              <p className="text-gray-600"><strong>System Size:</strong> {systemSize}</p>
              <p className="text-gray-600"><strong>Panel Specifications:</strong> {panelSpecifications}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
                <Battery className="mr-2" size={18} />
                Energy Production
              </h3>
              <p className="text-gray-600"><strong>Estimated Production:</strong> {estimatedEnergyProduction}</p>
              <p className="text-gray-600"><strong>Current Avg. Monthly Bill:</strong> RM{averageMonthlyElectricityBill}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-x-16 gap-y-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
                <DollarSign className="mr-2" size={18} />
                Financial Benefits
              </h3>
              <p className="text-gray-600"><strong>Savings:</strong> {savings}</p>
              <p className="text-gray-600"><strong>ROI:</strong> {roi}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
                <Clock className="mr-2" size={18} />
                Payback Period
              </h3>
              <p className="text-gray-600">{paybackPeriod}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
                <Percent className="mr-2" size={18} />
                Incentives
              </h3>
              <p className="text-gray-600">{incentives}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
              <DollarSign className="mr-2" size={18} />
              Cost Breakdown
            </h3>
            <p className="text-gray-600">{costBreakdown}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-16 gap-y-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
                <Shield className="mr-2" size={18} />
                Warranties
              </h3>
              <p className="text-gray-600">{productWarranties}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700 flex items-center">
                <Calendar className="mr-2" size={18} />
                Project Timeline
              </h3>
              <p className="text-gray-600">{timeline}</p>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex justify-between items-center text-sm text-gray-500">
            <p>Quotation created on: {new Date(createdAt).toLocaleDateString()}</p>
            <div className="flex items-center">
              <CheckCircle className="mr-2" size={16} />
              <span>{status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumerQuotationView;