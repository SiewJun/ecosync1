import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Filter, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const IncentivesManagement = () => {
  const [incentives, setIncentives] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentIncentive, setCurrentIncentive] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIncentive, setSelectedIncentive] = useState(null);
  const [incentiveToDelete, setIncentiveToDelete] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    region: "",
    eligibilityCriteria: "",
    incentiveAmount: "",
    expirationDate: "",
    applicationLink: "",
    source: "",
    status: "ACTIVE",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchIncentives();
  }, []);

  const fetchIncentives = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin-moderation/incentives",
        {
          credentials: "include", // Include credentials in the request
        }
      );
      const data = await response.json();
      setIncentives(data.incentives);
    } catch (error) {
      console.error("Error fetching incentives:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleStatusChange = (value) => {
    setFormData({
      ...formData,
      status: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = currentIncentive
        ? `http://localhost:5000/api/admin-moderation/incentives/${currentIncentive.id}`
        : "http://localhost:5000/api/admin-moderation/incentives";

      const method = currentIncentive ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include", // Include credentials in the request
      });

      if (response.ok) {
        setIsOpen(false);
        fetchIncentives();
        resetForm();
      }
    } catch (error) {
      console.error("Error saving incentive:", error);
    }
  };

  const handleView = (incentive) => {
    setSelectedIncentive(incentive);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (incentive) => {
    setIncentiveToDelete(incentive);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!incentiveToDelete?.id) return;
  
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin-moderation/incentives/${incentiveToDelete.id}`,
        {
          method: "DELETE",
          credentials: "include", // Include credentials in the request
        }
      );
  
      if (response.ok) {
        await fetchIncentives();
        setIsDeleteDialogOpen(false);
        setIncentiveToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting incentive:", error);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setIncentiveToDelete(null);
  };

  const handleEdit = (incentive) => {
    setCurrentIncentive(incentive);
    setFormData({
      title: incentive.title,
      description: incentive.description,
      region: incentive.region,
      eligibilityCriteria: incentive.eligibilityCriteria,
      incentiveAmount: incentive.incentiveAmount,
      expirationDate: incentive.expirationDate?.split("T")[0] || "",
      applicationLink: incentive.applicationLink || "",
      source: incentive.source,
      status: incentive.status,
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setCurrentIncentive(null);
    setFormData({
      title: "",
      description: "",
      region: "",
      eligibilityCriteria: "",
      incentiveAmount: "",
      expirationDate: "",
      applicationLink: "",
      source: "",
      status: "ACTIVE",
    });
  };

  const filteredIncentives = incentives.filter(
    (incentive) =>
      (statusFilter === "ALL" || incentive.status === statusFilter) &&
      (incentive.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incentive.region.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredIncentives.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredIncentives.length / itemsPerPage);

  const PaginationControls = () => (
    <div className="flex items-center justify-between px-2 py-3 border-t">
      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-700">
          Showing {indexOfFirstItem + 1} to{" "}
          {Math.min(indexOfLastItem, filteredIncentives.length)} of{" "}
          {filteredIncentives.length} entries
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-inter">
          Solar Incentives Management{" "}
        </h1>
        <p className="mt-2 text-gray-500">
          Manage and track your organization&apos;s solar incentives.
        </p>
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Incentive
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {currentIncentive ? "Edit Incentive" : "Add New Incentive"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="incentiveAmount">Incentive Amount</Label>
                <Input
                  id="incentiveAmount"
                  name="incentiveAmount"
                  value={formData.incentiveAmount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expirationDate">Expiration Date</Label>
                <Input
                  type="date"
                  id="expirationDate"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicationLink">Application Link</Label>
                <Input
                  id="applicationLink"
                  name="applicationLink"
                  value={formData.applicationLink}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="eligibilityCriteria">
                  Eligibility Criteria
                </Label>
                <Textarea
                  id="eligibilityCriteria"
                  name="eligibilityCriteria"
                  value={formData.eligibilityCriteria}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button type="submit">
                {currentIncentive ? "Update" : "Create"} Incentive
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={isViewDialogOpen}
        onOpenChange={(open) => {
          setIsViewDialogOpen(open);
          if (!open) setSelectedIncentive(null);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              View Incentive Details
            </DialogTitle>
          </DialogHeader>
          {selectedIncentive && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Title</Label>
                <p className="text-sm">{selectedIncentive.title}</p>
              </div>
              <div className="space-y-2">
                <Label>Region</Label>
                <p className="text-sm">{selectedIncentive.region}</p>
              </div>
              <div className="space-y-2">
                <Label>Incentive Amount</Label>
                <p className="text-sm">{selectedIncentive.incentiveAmount}</p>
              </div>
              <div className="space-y-2">
                <Label>Expiration Date</Label>
                <p className="text-sm">
                  {selectedIncentive.expirationDate
                    ? new Date(
                        selectedIncentive.expirationDate
                      ).toLocaleDateString()
                    : "No expiration"}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Application Link</Label>
                <p className="text-sm">
                  {selectedIncentive.applicationLink || "Not available"}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <p className="text-sm">{selectedIncentive.source}</p>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Description</Label>
                <p className="text-sm whitespace-pre-wrap">
                  {selectedIncentive.description}
                </p>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Eligibility Criteria</Label>
                <p className="text-sm whitespace-pre-wrap">
                  {selectedIncentive.eligibilityCriteria}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Status </Label>
                <span
                  className={`text-xs font-medium ${
                    selectedIncentive.status === "ACTIVE"
                      ? "text-green-500"
                      : selectedIncentive.status === "INACTIVE"
                      ? "text-gray-500"
                      : "text-red-500"
                  }`}
                >
                  {selectedIncentive.status}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setIncentiveToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this incentive? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search incentives..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-lg border overflow-x-auto">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Region</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Expiration</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((incentive) => (
                <TableRow key={incentive.id}>
                  <TableCell className="font-medium">
                    {incentive.title}
                  </TableCell>
                  <TableCell>{incentive.region}</TableCell>
                  <TableCell>{incentive.incentiveAmount}</TableCell>
                  <TableCell>
                    {incentive.expirationDate
                      ? new Date(incentive.expirationDate).toLocaleDateString()
                      : "No expiration"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        incentive.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : incentive.status === "INACTIVE"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {incentive.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(incentive)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteClick(incentive)}
                        className="hover:bg-gray-100 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleView(incentive)}
                        className="hover:bg-gray-100 hover:text-blue-600"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls />
        </div>
      </div>
    </div>
  );
};

export default IncentivesManagement;
