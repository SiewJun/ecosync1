import React, { useState, useEffect } from "react";
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
  Plus,
  Trash2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    estimatedEnergyProduction: "",
    savings: "",
    paybackPeriod: "",
    roi: "",
    incentives: "",
    productWarranties: "",
    status: "",
  });
  const [costBreakdown, setCostBreakdown] = useState([
    { item: "", quantity: "", unitPrice: "", totalPrice: "" },
  ]);
  const [timeline, setTimeline] = useState([
    { phase: "", startDate: "", endDate: "", description: "" },
  ]);

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
      const { costBreakdown, timeline, ...rest } = response.data;
      setQuotationData(rest);
      setCostBreakdown(costBreakdown || []);
      setTimeline(timeline || []);
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

  const handleCostBreakdownChange = (index, field, value) => {
    const updatedCostBreakdown = [...costBreakdown];
    updatedCostBreakdown[index][field] = value;
    if (field === "quantity" || field === "unitPrice") {
      const quantity = parseFloat(updatedCostBreakdown[index].quantity) || 0;
      const unitPrice = parseFloat(updatedCostBreakdown[index].unitPrice) || 0;
      updatedCostBreakdown[index].totalPrice = (quantity * unitPrice).toFixed(
        2
      );
    }
    setCostBreakdown(updatedCostBreakdown);
  };

  const addCostBreakdownRow = () => {
    setCostBreakdown([
      ...costBreakdown,
      { item: "", quantity: "", unitPrice: "", totalPrice: "" },
    ]);
  };

  const removeCostBreakdownRow = (index) => {
    const updatedCostBreakdown = costBreakdown.filter((_, i) => i !== index);
    setCostBreakdown(updatedCostBreakdown);
  };

  const handleTimelineChange = (index, field, value) => {
    const updatedTimeline = [...timeline];
    updatedTimeline[index][field] = value;
    setTimeline(updatedTimeline);
  };

  const DateInput = React.forwardRef((props, ref) => (
    <Input
      {...props}
      ref={ref}
      type="date"
      className="text-foreground bg-accent border-input"
    />
  ));
  DateInput.displayName = "DateInput";

  const addTimelinePhase = () => {
    setTimeline([
      ...timeline,
      { phase: "", startDate: "", endDate: "", description: "" },
    ]);
  };

  const removeTimelinePhase = (index) => {
    const updatedTimeline = timeline.filter((_, i) => i !== index);
    setTimeline(updatedTimeline);
  };

  const validateForm = () => {
    const requiredFields = [
      "systemSize",
      "panelSpecifications",
      "estimatedEnergyProduction",
      "savings",
      "paybackPeriod",
      "roi",
      "incentives",
      "productWarranties",
    ];

    for (const field of requiredFields) {
      if (!quotationData[field]) {
        return false;
      }
    }

    if (
      costBreakdown.some(
        (item) => !item.item || !item.quantity || !item.unitPrice
      )
    ) {
      return false;
    }

    if (
      timeline.some(
        (phase) =>
          !phase.phase ||
          !phase.startDate ||
          !phase.endDate ||
          !phase.description
      )
    ) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (action) => {
    if (!validateForm()) {
      setError("Please fill in all required fields.");
      return;
    }

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
          costBreakdown,
          timeline,
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costBreakdown.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={item.item}
                          onChange={(e) =>
                            handleCostBreakdownChange(
                              index,
                              "item",
                              e.target.value
                            )
                          }
                          placeholder="Item description"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleCostBreakdownChange(
                              index,
                              "quantity",
                              e.target.value
                            )
                          }
                          placeholder="Quantity"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleCostBreakdownChange(
                              index,
                              "unitPrice",
                              e.target.value
                            )
                          }
                          placeholder="Unit Price"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.totalPrice}
                          readOnly
                          placeholder="Total Price"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeCostBreakdownRow(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button
                type="button"
                onClick={addCostBreakdownRow}
                className="mt-2"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phase</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeline.map((phase, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={phase.phase}
                          onChange={(e) =>
                            handleTimelineChange(index, "phase", e.target.value)
                          }
                          placeholder="Phase name"
                        />
                      </TableCell>
                      <TableCell>
                        <DateInput
                          value={phase.startDate}
                          onChange={(e) =>
                            handleTimelineChange(
                              index,
                              "startDate",
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <DateInput
                          value={phase.endDate}
                          onChange={(e) =>
                            handleTimelineChange(
                              index,
                              "endDate",
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={phase.description}
                          onChange={(e) =>
                            handleTimelineChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Phase description"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeTimelinePhase(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button type="button" onClick={addTimelinePhase} className="mt-2">
                <Plus className="mr-2 h-4 w-4" /> Add Phase
              </Button>
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
