import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';
import { PencilIcon, TrashIcon } from 'lucide-react';

const AdminIncentives = () => {
  const [incentives, setIncentives] = useState([]);
  const [editingIncentive, setEditingIncentive] = useState(null);
  const [newIncentive, setNewIncentive] = useState({ title: '', description: '', amount: 0, eligibilityCriteria: '' });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchIncentives = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin-moderation/incentives', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setIncentives(response.data.incentives);
    } catch (error) {
      console.error('Error fetching incentives:', error);
    }
  };

  useEffect(() => {
    fetchIncentives();
  }, []);

  const handleAddIncentive = async () => {
    try {
      await axios.post('http://localhost:5000/api/admin-moderation/incentives', newIncentive, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNewIncentive({ title: '', description: '', amount: 0, eligibilityCriteria: '' });
      setIsAddDialogOpen(false);
      fetchIncentives();
    } catch (error) {
      console.error('Error adding incentive:', error);
    }
  };

  const handleEditIncentive = async () => {
    try {
      await axios.put(`http://localhost:5000/api/admin-moderation/incentives/${editingIncentive.id}`, editingIncentive, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setEditingIncentive(null);
      setIsEditDialogOpen(false);
      fetchIncentives();
    } catch (error) {
      console.error('Error editing incentive:', error);
    }
  };

  const handleDeleteIncentive = async (id) => {
    if (window.confirm('Are you sure you want to delete this incentive?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin-moderation/incentives/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        fetchIncentives();
      } catch (error) {
        console.error('Error deleting incentive:', error);
      }
    }
  };

  return (
    <div className="p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16">
      <h1 className="text-3xl font-bold mb-6">Manage Incentives</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {incentives.map((incentive) => (
          <Card key={incentive.id}>
            <CardContent>
              <h3 className="text-xl font-bold mb-2">{incentive.title}</h3>
              <p className="text-gray-500 mb-4">{incentive.description}</p>
              <p className="text-gray-700 font-medium mb-2">Amount: ${incentive.amount}</p>
              <p className="text-gray-700 font-medium mb-2">Eligibility: {incentive.eligibilityCriteria}</p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Tooltip content="Edit Incentive">
                <Button onClick={() => {
                  setEditingIncentive(incentive);
                  setIsEditDialogOpen(true);
                }}>
                  <PencilIcon />
                </Button>
              </Tooltip>
              <Tooltip content="Delete Incentive">
                <Button variant="danger" onClick={() => handleDeleteIncentive(incentive.id)}>
                  <TrashIcon />
                </Button>
              </Tooltip>
            </CardFooter>
          </Card>
        ))}
        <Card>
          <CardContent className="flex justify-center items-center h-full">
            <Button onClick={() => setIsAddDialogOpen(true)}>Add New Incentive</Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogHeader>
          <DialogTitle>Add New Incentive</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="mb-4">
            <label htmlFor="title" className="block font-medium mb-1">Title</label>
            <input
              id="title"
              type="text"
              placeholder="Incentive Title"
              value={newIncentive.title}
              onChange={(e) => setNewIncentive({ ...newIncentive, title: e.target.value })}
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block font-medium mb-1">Description</label>
            <textarea
              id="description"
              placeholder="Incentive Description"
              value={newIncentive.description}
              onChange={(e) => setNewIncentive({ ...newIncentive, description: e.target.value })}
              className="border rounded p-2 w-full"
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block font-medium mb-1">Amount</label>
            <input
              id="amount"
              type="number"
              placeholder="Incentive Amount"
              value={newIncentive.amount}
              onChange={(e) => setNewIncentive({ ...newIncentive, amount: Number(e.target.value) })}
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="eligibilityCriteria" className="block font-medium mb-1">Eligibility Criteria</label>
            <input
              id="eligibilityCriteria"
              type="text"
              placeholder="Eligibility Criteria"
              value={newIncentive.eligibilityCriteria}
              onChange={(e) => setNewIncentive({ ...newIncentive, eligibilityCriteria: e.target.value })}
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleAddIncentive}>Add Incentive</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogHeader>
          <DialogTitle>Edit Incentive</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="mb-4">
            <label htmlFor="title" className="block font-medium mb-1">Title</label>
            <input
              id="title"
              type="text"
              placeholder="Incentive Title"
              value={editingIncentive?.title}
              onChange={(e) => setEditingIncentive({ ...editingIncentive, title: e.target.value })}
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block font-medium mb-1">Description</label>
            <textarea
              id="description"
              placeholder="Incentive Description"
              value={editingIncentive?.description}
              onChange={(e) => setEditingIncentive({ ...editingIncentive, description: e.target.value })}
              className="border rounded p-2 w-full"
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="amount" className="block font-medium mb-1">Amount</label>
            <input
              id="amount"
              type="number"
              placeholder="Incentive Amount"
              value={editingIncentive?.amount}
              onChange={(e) => setEditingIncentive({ ...editingIncentive, amount: Number(e.target.value) })}
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="eligibilityCriteria" className="block font-medium mb-1">Eligibility Criteria</label>
            <input
              id="eligibilityCriteria"
              type="text"
              placeholder="Eligibility Criteria"
              value={editingIncentive?.eligibilityCriteria}
              onChange={(e) => setEditingIncentive({ ...editingIncentive, eligibilityCriteria: e.target.value })}
              className="border rounded p-2 w-full"
            />
          </div>
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleEditIncentive}>Update Incentive</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminIncentives;