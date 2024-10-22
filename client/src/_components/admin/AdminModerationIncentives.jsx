import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, DollarSign, Users } from "lucide-react";
import PropTypes from "prop-types";

const AdminIncentives = () => {
  const [incentives, setIncentives] = useState([]);
  const [editingIncentive, setEditingIncentive] = useState(null);
  const [newIncentive, setNewIncentive] = useState({
    title: "",
    description: "",
    amount: 0,
    eligibilityCriteria: "",
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchIncentives = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin-moderation/incentives",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await response.json();
      setIncentives(data.incentives);
    } catch (error) {
      console.error("Error fetching incentives:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncentives();
  }, []);

  const handleAddIncentive = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/admin-moderation/incentives",
        newIncentive,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setNewIncentive({
        title: "",
        description: "",
        amount: 0,
        eligibilityCriteria: "",
      });
      setIsAddDialogOpen(false);
      fetchIncentives();
    } catch (error) {
      console.error("Error adding incentive:", error);
    }
  };

  const handleEditIncentive = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin-moderation/incentives/${editingIncentive.id}`,
        editingIncentive,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setEditingIncentive(null);
      setIsEditDialogOpen(false);
      fetchIncentives();
    } catch (error) {
      console.error("Error editing incentive:", error);
    }
  };

  const handleDeleteIncentive = async (id) => {
    if (window.confirm("Are you sure you want to delete this incentive?")) {
      try {
        await axios.delete(
          `http://localhost:5000/api/admin-moderation/incentives/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        fetchIncentives();
      } catch (error) {
        console.error("Error deleting incentive:", error);
      }
    }
  };

  const IncentiveForm = ({ data, onChange, onSubmit, submitText }) => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Title</label>
        <Input
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className="w-full"
          placeholder="e.g., Early Bird Bonus"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <Textarea
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          className="w-full min-h-[100px]"
          placeholder="Describe the incentive and its benefits..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Amount ($)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              type="number"
              value={data.amount}
              onChange={(e) =>
                onChange({ ...data, amount: Number(e.target.value) })
              }
              className="pl-10"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Eligibility
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              value={data.eligibilityCriteria}
              onChange={(e) =>
                onChange({ ...data, eligibilityCriteria: e.target.value })
              }
              className="pl-10"
              placeholder="Who can apply?"
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={onSubmit} variant="default">
          {submitText}
        </Button>
      </div>
    </div>
  );
  IncentiveForm.propTypes = {
    data: PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      amount: PropTypes.number,
      eligibilityCriteria: PropTypes.string,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    submitText: PropTypes.string.isRequired,
  };

  return (
    <div className="container p-6">
      <div className="mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-inter">
              Incentive Programs
            </h1>
            <p className="mt-2 text-gray-500">
              Manage and track your organization&apos;s incentive offerings
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} variant="default">
            <Plus className="w-4 h-4" />
            <span>New Incentive</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-48 bg-gray-100" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {incentives.map((incentive) => (
              <Card
                key={incentive.id}
                className="group hover:shadow-lg transition-shadow duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {incentive.title}
                    </h3>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingIncentive(incentive);
                          setIsEditDialogOpen(true);
                        }}
                        className="text-gray-600 hover:text-blue-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteIncentive(incentive.id)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {incentive.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium">
                        ${incentive.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">
                        {incentive.eligibilityCriteria}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Incentive</DialogTitle>
              <DialogDescription>
                Add a new incentive program to your organization&apos;s
                offerings.
              </DialogDescription>
            </DialogHeader>
            <IncentiveForm
              data={newIncentive}
              onChange={setNewIncentive}
              onSubmit={handleAddIncentive}
              submitText="Create Incentive"
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Incentive</DialogTitle>
              <DialogDescription>
                Modify the details of your existing incentive program.
              </DialogDescription>
            </DialogHeader>
            <IncentiveForm
              data={editingIncentive || {}}
              onChange={setEditingIncentive}
              onSubmit={handleEditIncentive}
              submitText="Save Changes"
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminIncentives;
