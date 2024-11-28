import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ArrowLeftCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast"; 
import { Toaster } from "@/components/ui/toaster";

const QuotationDrafting = () => {
  const { quotationId } = useParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
      if (!formData[field]) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError("Please fill in all required fields.");
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post(
        `http://localhost:5000/api/quotation/draft/${quotationId}`,
        {
          ...formData,
          costBreakdown,
          timeline,
        },
        {
          withCredentials: true,
        }
      );

      toast({
        title: "Success",
        description: "Quotation drafted successfully!",
      });

      // Reset form state to allow for multiple submissions
      setFormData({
        systemSize: "",
        panelSpecifications: "",
        estimatedEnergyProduction: "",
        savings: "",
        paybackPeriod: "",
        roi: "",
        incentives: "",
        productWarranties: "",
      });
      setCostBreakdown([{ item: "", quantity: "", unitPrice: "", totalPrice: "" }]);
      setTimeline([{ phase: "", startDate: "", endDate: "", description: "" }]);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Failed to draft quotation. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to draft quotation. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen container p-6">
      <Toaster />
      <Link
        to={-1}
        className="inline-flex items-center text-primary hover:text-black dark:hover:text-white mb-4"
      >
        <ArrowLeftCircle className="mr-2" size={16} />
        Back
      </Link>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Draft Quotation</h1>
        <Card className="shadow-lg">
          <CardHeader className="bg-gray-100">
            <CardTitle className="text-xl font-semibold">
              Draft Quotation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="systemSize">System Size</Label>
                  <Input
                    id="systemSize"
                    name="systemSize"
                    value={formData.systemSize}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="panelSpecifications">
                    Panel Specifications
                  </Label>
                  <Textarea
                    id="panelSpecifications"
                    name="panelSpecifications"
                    value={formData.panelSpecifications}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedEnergyProduction">
                    Estimated Energy Production
                  </Label>
                  <Input
                    id="estimatedEnergyProduction"
                    name="estimatedEnergyProduction"
                    value={formData.estimatedEnergyProduction}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="savings">Savings</Label>
                  <Input
                    id="savings"
                    name="savings"
                    value={formData.savings}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paybackPeriod">Payback Period</Label>
                  <Input
                    id="paybackPeriod"
                    name="paybackPeriod"
                    value={formData.paybackPeriod}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roi">ROI</Label>
                  <Input
                    id="roi"
                    name="roi"
                    value={formData.roi}
                    onChange={handleChange}
                    required
                    className="border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incentives">Incentives</Label>
                  <Textarea
                    id="incentives"
                    name="incentives"
                    value={formData.incentives}
                    onChange={handleChange}
                    className="border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productWarranties">Product Warranties</Label>
                  <Textarea
                    id="productWarranties"
                    name="productWarranties"
                    value={formData.productWarranties}
                    onChange={handleChange}
                    className="border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Cost Breakdown</h3>
                <ScrollArea className="h-[300px] border rounded-md">
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
                          {["item", "quantity", "unitPrice", "totalPrice"].map(
                            (field) => (
                              <TableCell key={field}>
                                <Input
                                  value={item[field]}
                                  onChange={(e) =>
                                    handleCostBreakdownChange(
                                      index,
                                      field,
                                      e.target.value
                                    )
                                  }
                                  type={
                                    field.includes("rice") ||
                                    field === "quantity"
                                      ? "number"
                                      : "text"
                                  }
                                  placeholder={
                                    field.charAt(0).toUpperCase() +
                                    field.slice(1)
                                  }
                                  disabled={field === "totalPrice"}
                                  className="w-full border-gray-300 focus:border-primary focus:ring-primary"
                                />
                              </TableCell>
                            )
                          )}
                          <TableCell>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeCostBreakdownRow(index)}
                              className="hover:bg-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                <Button
                  type="button"
                  onClick={addCostBreakdownRow}
                  className="flex items-center"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </div>

              <div className="space-y-6 mt-6">
                <h3 className="text-lg font-semibold">Project Timeline</h3>
                <ScrollArea className="h-[300px] border rounded-md">
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
                          {["phase", "startDate", "endDate", "description"].map(
                            (field) => (
                              <TableCell key={field}>
                                <Input
                                  type={
                                    field.includes("Date") ? "date" : "text"
                                  }
                                  value={phase[field]}
                                  onChange={(e) =>
                                    handleTimelineChange(
                                      index,
                                      field,
                                      e.target.value
                                    )
                                  }
                                  className="w-full border-gray-300 focus:border-primary focus:ring-primary"
                                />
                              </TableCell>
                            )
                          )}
                          <TableCell>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeTimelinePhase(index)}
                              className="hover:bg-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                <Button
                  type="button"
                  onClick={addTimelinePhase}
                  className="flex items-center"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Phase
                </Button>
              </div>

              {error && <p className="text-red-500 mt-4">{error}</p>}
              <Button
                type="submit"
                disabled={loading}
                className="mt-6 w-full py-3"
              >
                {loading ? "Saving..." : "Save Draft"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuotationDrafting;
