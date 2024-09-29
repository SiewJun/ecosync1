import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Save,
  Send,
  FileEdit,
  CheckCircle,
  ArrowLeftCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";

const QuotationDraft = () => {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNewQuotation, setIsNewQuotation] = useState(false);
  const [quotationVersionId, setQuotationVersionId] = useState(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const [quotationData, setQuotationData] = useState({
    systemSize: "",
    panelSpecifications: "",
    costBreakdown: "",
    estimatedEnergyProduction: "",
    savings: "",
    paybackPeriod: "",
    roi: "",
    incentives: "",
    productWarranties: "",
    timeline: "",
    status: "",
  });

  useEffect(() => {
    if (quotationId) {
      fetchQuotation();
    } else {
      setIsNewQuotation(true);
    }
  }, [quotationId]);

  const fetchQuotation = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/quotation/latest/${quotationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setQuotationData(response.data);
      setQuotationVersionId(response.data.id);
      setIsFinalized(response.data.status === "FINALIZED");
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setIsNewQuotation(true);
      } else {
        setError(
          "An error occurred while fetching the quotation. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuotationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (action) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const endpoint =
        action === "save" ? "/api/quotation/draft" : "/api/quotation/finalize";
      await axios.post(
        `http://localhost:5000${endpoint}`,
        {
          ...quotationData,
          quotationId: quotationId || undefined,
          quotationVersionId: quotationVersionId || undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      navigate("/company-dashboard/company-quotation");
    } catch (err) {
      setError(
        `Failed to ${
          action === "save" ? "save draft" : "finalize quotation"
        }. Please try again.`
      );
      console.error(
        `Error ${action === "save" ? "saving draft" : "finalizing quotation"}:`,
        err
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen container p-6">
      <Link
        to="/company-dashboard/company-quotation"
        className="inline-flex items-center text-primary hover:text-black  dark:hover:text-white mb-8"
      >
        <ArrowLeftCircle className="mr-2" size={16} />
        Back to Quotations
      </Link>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <FileEdit className="mr-2 h-6 w-6" />
            {isNewQuotation ? "Create New Quotation" : "Edit Quotation"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isNewQuotation && (
            <Alert className="mb-6">
              <FileEdit className="h-4 w-4" />
              <AlertTitle>New Quotation</AlertTitle>
              <AlertDescription>
                You&apos;re creating a new quotation draft. Fill in the details
                below and save when ready.
              </AlertDescription>
            </Alert>
          )}
          {isFinalized && (
            <Alert className="mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Finalized Quotation</AlertTitle>
              <AlertDescription>
                This quotation has been finalized and sent to the consumer. You
                cannot make further changes.
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="systemSize">System Size</Label>
                <Input
                  id="systemSize"
                  name="systemSize"
                  value={quotationData.systemSize}
                  onChange={handleChange}
                  placeholder="e.g., 5kW"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="panelSpecifications">
                  Panel Specifications
                </Label>
                <Input
                  id="panelSpecifications"
                  name="panelSpecifications"
                  value={quotationData.panelSpecifications}
                  onChange={handleChange}
                  placeholder="e.g., 20 x 250W Monocrystalline"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedEnergyProduction">
                  Estimated Energy Production
                </Label>
                <Input
                  id="estimatedEnergyProduction"
                  name="estimatedEnergyProduction"
                  value={quotationData.estimatedEnergyProduction}
                  onChange={handleChange}
                  placeholder="e.g., 7,000 kWh/year"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="savings">Savings</Label>
                <Input
                  id="savings"
                  name="savings"
                  value={quotationData.savings}
                  onChange={handleChange}
                  placeholder="e.g., RM1,200/year"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paybackPeriod">Payback Period</Label>
                <Input
                  id="paybackPeriod"
                  name="paybackPeriod"
                  value={quotationData.paybackPeriod}
                  onChange={handleChange}
                  placeholder="e.g., 7 years"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roi">ROI</Label>
                <Input
                  id="roi"
                  name="roi"
                  value={quotationData.roi}
                  onChange={handleChange}
                  placeholder="e.g., 15% over 25 years"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="costBreakdown">Cost Breakdown</Label>
              <Textarea
                id="costBreakdown"
                name="costBreakdown"
                value={quotationData.costBreakdown}
                onChange={handleChange}
                placeholder="Provide a detailed breakdown of costs"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="incentives">Incentives</Label>
              <Textarea
                id="incentives"
                name="incentives"
                value={quotationData.incentives}
                onChange={handleChange}
                placeholder="List any applicable incentives or rebates"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productWarranties">Product Warranties</Label>
              <Textarea
                id="productWarranties"
                name="productWarranties"
                value={quotationData.productWarranties}
                onChange={handleChange}
                placeholder="Describe the warranties for panels, inverters, etc."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeline">Project Timeline</Label>
              <Textarea
                id="timeline"
                name="timeline"
                value={quotationData.timeline}
                onChange={handleChange}
                placeholder="Outline the expected project timeline"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSubmit("save")}
                disabled={loading || isFinalized}
              >
                <Save className="mr-2 h-4 w-4" /> Save as Draft
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit("finalize")}
                disabled={loading || isFinalized}
              >
                <Send className="mr-2 h-4 w-4" /> Finalize Quotation
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationDraft;
