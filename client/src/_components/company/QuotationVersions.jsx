import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  CheckCircle2,
  Clock,
  DollarSign,
  SunDim,
  FileText,
  Loader2,
  Users,
  Package,
  Calendar,
  ArrowLeftCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const QuotationVersions = () => {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const [quotationVersions, setQuotationVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchQuotationVersions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/quotation/versions/${quotationId}`,
          { withCredentials: true }
        );
        setQuotationVersions(response.data.versions);
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Failed to load quotation versions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotationVersions();
  }, [quotationId]);

  const handleDraftQuotation = () => {
    navigate(`/company-dashboard/company-quotation/${quotationId}/draft`);
  };

  const handleUpdateVersion = (versionId) => {
    navigate(
      `/company-dashboard/company-quotation/${quotationId}/update-version/${versionId}`
    );
  };

  const handleSubmitVersion = async (versionId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/quotation/submit-version/${versionId}`,
        {},
        { withCredentials: true }
      );
      setQuotationVersions((prevVersions) =>
        prevVersions.map((version) =>
          version.id === versionId
            ? { ...version, status: "SUBMITTED" }
            : version
        )
      );
      toast({
        title: "Success",
        description: "Quotation version submitted successfully.",
        variant: "default",
      });
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Failed to submit quotation version. Please try again later.");
      toast({
        title: "Error",
        description:
          "Failed to submit quotation version. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleFinalizeQuotation = async (versionId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/quotation/finalize/${quotationId}`,
        {},
        { withCredentials: true }
      );
      setQuotationVersions((prevVersions) =>
        prevVersions.map((version) =>
          version.id === versionId
            ? { ...version, status: "FINALIZED" }
            : version
        )
      );
      toast({
        title: "Success",
        description: "Quotation finalized successfully.",
        variant: "default",
      });
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Failed to finalize quotation. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to finalize quotation. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const renderStatusBadge = (status) => {
    const statusColors = {
      DRAFT: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      PENDING: "bg-blue-100 text-blue-800",
      SUBMITTED: "bg-purple-100 text-purple-800",
      FINALIZED: "bg-primary text-primary-foreground",
    };

    return (
      <Badge
        variant="outline"
        className={`${
          statusColors[status] || "bg-gray-100 text-gray-800"
        } uppercase`}
      >
        {status}
      </Badge>
    );
  };

  const allVersionsSubmitted = quotationVersions.every(
    (version) => version.status === "SUBMITTED"
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4 text-center">
        <FileText className="h-16 w-16" />
        <h2 className="text-2xl font-semibold">Error</h2>
        <p className="text-gray-500 max-w-md">{error}</p>
      </div>
    );
  }

  if (quotationVersions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4 text-center">
        <FileText className="h-16 w-16" />
        <h2 className="text-2xl font-semibold">No Quotation Versions Found</h2>
        <p className="text-gray-500 max-w-md">
          No versions available for this quotation.
        </p>
        <Button onClick={handleDraftQuotation}>Create New Draft</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen container p-6 relative">
      <Toaster />
      <Link
        to={-1}
        className="inline-flex items-center text-primary hover:text-black dark:hover:text-white mb-4"
      >
        <ArrowLeftCircle className="mr-2" size={16} />
        Back
      </Link>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-bold">
            Quotation Versions for quotation: {quotationId}
          </h1>
          {allVersionsSubmitted && (
            <Button onClick={handleDraftQuotation}>Create New Draft</Button>
          )}
        </div>

        <Accordion
          type="single"
          collapsible
          className="w-full space-y-4 border"
        >
          {quotationVersions.map((version, index) => (
            <AccordionItem
              key={version.id}
              value={`version-${version.versionNumber}`}
            >
              <AccordionTrigger className="px-6 py-4 rounded-t-lg">
                <div className="flex items-center space-x-4 w-full">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <span className="text-lg font-semibold">
                    Version {version.versionNumber}
                  </span>
                  {renderStatusBadge(version.status)}
                  <span className="ml-auto text-sm">
                    {new Date(version.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 py-4">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* System Details */}
                  <div className="space-y-4 md:col-span-2">
                    <div className="flex items-center space-x-3 mb-4">
                      <SunDim className="h-6 w-6 text-primary" />
                      <h2 className="text-xl font-semibold">System Details</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium mb-2">
                          System Specifications
                        </h3>
                        <p>Size: {version.systemSize}</p>
                        <p>Panel Manufacturer: LONGi Solar</p>
                        <p>Panel Model: Hi-MO6</p>
                        <p>Power Output: 370W</p>
                        <p>Panel Quantity: 16</p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">Energy Production</h3>
                        <p>
                          Estimated Annual Production:{" "}
                          {version.estimatedEnergyProduction}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <DollarSign className="h-6 w-6 text-green-600" />
                      <h2 className="text-xl font-semibold">
                        Financial Projection
                      </h2>
                    </div>
                    <div className="space-y-2">
                      <p>
                        <strong>Annual Savings:</strong> {version.savings}
                      </p>
                      <p>
                        <strong>Payback Period:</strong> {version.paybackPeriod}
                      </p>
                      <p>
                        <strong>Return on Investment:</strong> {version.roi}
                      </p>
                      <p>
                        <strong>Incentives:</strong> {version.incentives}
                      </p>
                      <p>
                        <strong>Product Warranties:</strong>{" "}
                        {version.productWarranties} years
                      </p>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="md:col-span-3 space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <Package className="h-6 w-6 text-blue-600" />
                      <h2 className="text-xl font-semibold">Cost Breakdown</h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="border p-2 text-left">Item</th>
                            <th className="border p-2 text-right">Quantity</th>
                            <th className="border p-2 text-right">
                              Unit Price
                            </th>
                            <th className="border p-2 text-right">
                              Total Price
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {version.costBreakdown.map((item, index) => (
                            <tr key={index}>
                              <td className="border p-2">
                                {item.item || "N/A"}
                              </td>
                              <td className="border p-2 text-right">
                                {item.quantity || "N/A"}
                              </td>
                              <td className="border p-2 text-right">
                                {item.unitPrice || "N/A"}
                              </td>
                              <td className="border p-2 text-right">
                                {item.totalPrice || "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="md:col-span-3 space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <Clock className="h-6 w-6 text-purple-600" />
                      <h2 className="text-xl font-semibold">
                        Project Timeline
                      </h2>
                    </div>
                    <div className="space-y-2">
                      {version.timeline.map((phase, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-md border flex justify-between items-center"
                        >
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5" />
                            <div>
                              <h3 className="font-medium">{phase.phase}</h3>
                              <p className="text-sm">{phase.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {phase.startDate} - {phase.endDate}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer and Company Details */}
                  <div className="md:col-span-3 space-y-4">
                    <Separator />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <Users className="h-6 w-6" />
                        <div>
                          <h3 className="font-semibold">Customer Details</h3>
                          <p>{version.quotation.consumer.username}</p>
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <Button
                          onClick={() => handleUpdateVersion(version.id)}
                          disabled={
                            version.status === "SUBMITTED" ||
                            version.status === "FINALIZED"
                          }
                          variant="outline"
                        >
                          Update Version
                        </Button>
                        <Button
                          onClick={() => handleSubmitVersion(version.id)}
                          disabled={
                            version.status === "SUBMITTED" ||
                            version.status === "FINALIZED"
                          }
                        >
                          Submit Version
                        </Button>
                        {index === quotationVersions.length - 1 &&
                          version.status === "SUBMITTED" && (
                            <Button
                              onClick={() =>
                                handleFinalizeQuotation(version.id)
                              }
                            >
                              Finalize Quotation
                            </Button>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default QuotationVersions;
