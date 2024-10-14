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
  Eye,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import PropTypes from "prop-types";

const QuotationPreview = ({ quotationData, costBreakdown, timeline }) => {
  return (
    <ScrollArea className="h-[80vh] w-full">
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <h2 className="text-xl md:text-2xl font-bold">Quotation Preview</h2>
        <p>Quotation Version: {quotationData.id}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">System Size</h3>
            <p>{quotationData.systemSize}</p>
          </div>
          <div>
            <h3 className="font-semibold">Panel Specifications</h3>
            <p>{quotationData.panelSpecifications}</p>
          </div>
          <div>
            <h3 className="font-semibold">Estimated Energy Production</h3>
            <p>{quotationData.estimatedEnergyProduction}</p>
          </div>
          <div>
            <h3 className="font-semibold">Savings</h3>
            <p>{quotationData.savings}</p>
          </div>
          <div>
            <h3 className="font-semibold">Payback Period</h3>
            <p>{quotationData.paybackPeriod}</p>
          </div>
          <div>
            <h3 className="font-semibold">ROI</h3>
            <p>{quotationData.roi}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Cost Breakdown</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costBreakdown.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.item}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unitPrice}</TableCell>
                  <TableCell>{item.totalPrice}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="font-semibold">Incentives</h3>
          <p>{quotationData.incentives}</p>
        </div>
        <div>
          <h3 className="font-semibold">Product Warranties</h3>
          <p>{quotationData.productWarranties}</p>
        </div>
        <div>
          <h3 className="font-semibold">Project Timeline</h3>
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
                  <TableCell>{phase.startDate}</TableCell>
                  <TableCell>{phase.endDate}</TableCell>
                  <TableCell>{phase.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </ScrollArea>
  );
};

const QuotationDraft = () => {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNewQuotation, setIsNewQuotation] = useState(false);
  const [quotationVersionId, setQuotationVersionId] = useState(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const [canFinalize, setCanFinalize] = useState(false);
  const [quotationData, setQuotationData] = useState({
    systemSize: "",
    panelSpecifications: "",
    estimatedEnergyProduction: "",
    savings: "",
    paybackPeriod: "",
    roi: "",
    incentives: "",
    productWarranties: "",
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
      setCanFinalize(false);
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
      if (response.data.isNewQuotation) {
        setIsNewQuotation(true);
        setCanFinalize(false);
      } else {
        const { costBreakdown, timeline, canFinalize, ...rest } = response.data;
        setQuotationData(rest);
        setCostBreakdown(costBreakdown || []);
        setTimeline(timeline || []);
        setQuotationVersionId(response.data.id);
        setIsFinalized(response.data.status === "FINALIZED");
        setCanFinalize(canFinalize);
        setIsNewQuotation(false);
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError(
        "An error occurred while fetching the quotation. Please try again."
      );
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
    <div className="min-h-screen container px-4 py-6 md:p-6">
      <Link
        to="/company-dashboard/company-quotation"
        className="inline-flex items-center text-primary hover:text-black dark:hover:text-white mb-4 md:mb-8"
      >
        <ArrowLeftCircle className="mr-2" size={16} />
        Back to Quotations
      </Link>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-bold flex flex-col md:flex-row items-start md:items-center justify-between">
            <span className="flex items-center mb-2 md:mb-0">
              <FileEdit className="mr-2 h-5 w-5 md:h-6 md:w-6" />
              {isNewQuotation ? "Create New Quotation" : "Edit Quotation"}
            </span>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mt-2 md:mt-0">
                  <Eye className="mr-2 h-4 w-4" /> Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-4xl">
                <QuotationPreview
                  quotationData={quotationData}
                  costBreakdown={costBreakdown}
                  timeline={timeline}
                />
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(95vh-200px)]">
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {isNewQuotation && (
                <Alert className="mb-6">
                  <FileEdit className="h-4 w-4" />
                  <AlertTitle>New Quotation</AlertTitle>
                  <AlertDescription>
                    You&apos;re creating a new quotation draft. Fill in the
                    details below and save when ready.
                  </AlertDescription>
                </Alert>
              )}
              {isFinalized && (
                <Alert className="mb-6">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Finalized Quotation</AlertTitle>
                  <AlertDescription>
                    This quotation has been finalized and sent to the consumer.
                    You cannot make further changes.
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
              <form className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {Object.entries(quotationData).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Label>
                      <Input
                        id={key}
                        name={key}
                        value={value}
                        onChange={handleChange}
                        placeholder={`Enter ${key}`}
                        disabled={isFinalized}
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costBreakdown">Cost Breakdown</Label>
                  <div className="overflow-x-auto">
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
                                onChange={(e) => handleCostBreakdownChange(index, "item", e.target.value)}
                                placeholder="Item description"
                                disabled={isFinalized}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleCostBreakdownChange(index, "quantity", e.target.value)}
                                placeholder="Quantity"
                                disabled={isFinalized}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => handleCostBreakdownChange(index, "unitPrice", e.target.value)}
                                placeholder="Unit Price"
                                disabled={isFinalized}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={item.totalPrice}
                                readOnly
                                placeholder="Total Price"
                                disabled={isFinalized}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeCostBreakdownRow(index)}
                                disabled={isFinalized}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Button
                    type="button"
                    onClick={addCostBreakdownRow}
                    className="mt-2"
                    disabled={isFinalized}
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
                    disabled={isFinalized}
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
                    disabled={isFinalized}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeline">Project Timeline</Label>
                  <div className="overflow-x-auto">
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
                                onChange={(e) => handleTimelineChange(index, "phase", e.target.value)}
                                placeholder="Phase name"
                                disabled={isFinalized}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="date"
                                value={phase.startDate}
                                onChange={(e) => handleTimelineChange(index, "startDate", e.target.value)}
                                disabled={isFinalized}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="date"
                                value={phase.endDate}
                                onChange={(e) => handleTimelineChange(index, "endDate", e.target.value)}
                                disabled={isFinalized}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={phase.description}
                                onChange={(e) => handleTimelineChange(index, "description", e.target.value)}
                                placeholder="Phase description"
                                disabled={isFinalized}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeTimelinePhase(index)}
                                disabled={isFinalized}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Button
                    type="button"
                    onClick={addTimelinePhase}
                    className="mt-2"
                    disabled={isFinalized}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Phase
                  </Button>
                </div>
                <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSubmit("save")}
                    disabled={loading || isFinalized}
                    className="w-full md:w-auto"
                  >
                    <Save className="mr-2 h-4 w-4" /> Save as Draft
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSubmit("finalize")}
                    disabled={loading || isFinalized || !canFinalize}
                    className="w-full md:w-auto"
                  >
                    <Send className="mr-2 h-4 w-4" /> Finalize Quotation
                  </Button>
                </div>
              </form>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

QuotationPreview.propTypes = {
  quotationData: PropTypes.shape({
    id: PropTypes.string,
    systemSize: PropTypes.string,
    panelSpecifications: PropTypes.string,
    estimatedEnergyProduction: PropTypes.string,
    savings: PropTypes.string,
    paybackPeriod: PropTypes.string,
    roi: PropTypes.string,
    incentives: PropTypes.string,
    productWarranties: PropTypes.string,
  }).isRequired,
  costBreakdown: PropTypes.arrayOf(
    PropTypes.shape({
      item: PropTypes.string,
      quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      unitPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      totalPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  timeline: PropTypes.arrayOf(
    PropTypes.shape({
      phase: PropTypes.string,
      startDate: PropTypes.string,
      endDate: PropTypes.string,
      description: PropTypes.string,
    })
  ).isRequired,
};

export default QuotationDraft;
