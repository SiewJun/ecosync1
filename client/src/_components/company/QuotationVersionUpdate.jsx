import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ArrowLeftCircle, Loader2, FileText } from "lucide-react";
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

const QuotationVersionUpdate = () => {
  const { versionId } = useParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    systemSize: "",
    panelSpecifications: "",
    costBreakdown: [],
    estimatedEnergyProduction: "",
    savings: "",
    paybackPeriod: "",
    roi: "",
    incentives: "",
    productWarranties: "",
    timeline: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuotationVersion = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/quotation/version-details/${versionId}`,
          { withCredentials: true }
        );
        setFormData(response.data);
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Failed to load quotation version. Please try again later.");
      }
    };

    fetchQuotationVersion();
  }, [versionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCostBreakdownChange = (index, field, value) => {
    const updatedCostBreakdown = [...formData.costBreakdown];
    updatedCostBreakdown[index][field] = value;
    if (field === "quantity" || field === "unitPrice") {
      const quantity = parseFloat(updatedCostBreakdown[index].quantity) || 0;
      const unitPrice = parseFloat(updatedCostBreakdown[index].unitPrice) || 0;
      updatedCostBreakdown[index].totalPrice = (quantity * unitPrice).toFixed(
        2
      );
    }
    setFormData({ ...formData, costBreakdown: updatedCostBreakdown });
  };

  const addCostBreakdownRow = () => {
    setFormData({
      ...formData,
      costBreakdown: [
        ...formData.costBreakdown,
        { item: "", quantity: "", unitPrice: "", totalPrice: "" },
      ],
    });
  };

  const removeCostBreakdownRow = (index) => {
    const updatedCostBreakdown = formData.costBreakdown.filter((_, i) => i !== index);
    setFormData({ ...formData, costBreakdown: updatedCostBreakdown });
  };

  const handleTimelineChange = (index, field, value) => {
    const updatedTimeline = [...formData.timeline];
    updatedTimeline[index][field] = value;
    setFormData({ ...formData, timeline: updatedTimeline });
  };

  const addTimelinePhase = () => {
    setFormData({
      ...formData,
      timeline: [
        ...formData.timeline,
        { phase: "", startDate: "", endDate: "", description: "" },
      ],
    });
  };

  const removeTimelinePhase = (index) => {
    const updatedTimeline = formData.timeline.filter((_, i) => i !== index);
    setFormData({ ...formData, timeline: updatedTimeline });
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
      formData.costBreakdown.some(
        (item) => !item.item || !item.quantity || !item.unitPrice
      )
    ) {
      return false;
    }

    if (
      formData.timeline.some(
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
      await axios.put(
        `http://localhost:5000/api/quotation/update-version/${versionId}`,
        formData,
        { withCredentials: true }
      );
      toast({
        title: "Success",
        description: "Quotation version updated successfully.",
      });
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update quotation version. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className="text-2xl font-semibold">
          Error
        </h2>
        <p className="text-gray-500 max-w-md">{error}</p>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold mb-8 text-center">Update Quotation Version</h1>
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
              <Label htmlFor="panelSpecifications">Panel Specifications</Label>
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
              <Label htmlFor="estimatedEnergyProduction">Estimated Energy Production</Label>
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
                  {formData.costBreakdown.map((item, index) => (
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
                                field.includes("rice") || field === "quantity"
                                  ? "number"
                                  : "text"
                              }
                              placeholder={
                                field.charAt(0).toUpperCase() + field.slice(1)
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
                  {formData.timeline.map((phase, index) => (
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
            {loading ? "Updating..." : "Update"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default QuotationVersionUpdate;