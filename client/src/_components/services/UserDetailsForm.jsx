import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Home, Building } from "lucide-react";

const UserDetailsForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    salutation: '',
    name: '',
    email: '',
    phone: '',
    avgElectricityBill: '',
    address: '',
    propertyType: '',
    state: '',
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Personal Details</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salutation">Salutation</Label>
              <Select onValueChange={(value) => handleChange('salutation', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mr">Mr.</SelectItem>
                  <SelectItem value="Mrs">Mrs.</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="pl-10"
                  placeholder="Full Name"
                  required
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="pl-10"
                placeholder="Email Address"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="pl-10"
                placeholder="Phone Number"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="avgElectricityBill">Average Monthly Electricity Bill (RM)</Label>
            <Input
              id="avgElectricityBill"
              name="avgElectricityBill"
              type="number"
              value={formData.avgElectricityBill}
              onChange={(e) => handleChange('avgElectricityBill', e.target.value)}
              placeholder="e.g. 200"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="pl-10"
                placeholder="Full Address"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Select onValueChange={(value) => handleChange('propertyType', value)} required>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bungalow">Bungalow</SelectItem>
                    <SelectItem value="semi-detached">Semi Detached</SelectItem>
                    <SelectItem value="terrace">Terrace/Linked House</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select onValueChange={(value) => handleChange('state', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Johor">Johor</SelectItem>
                  <SelectItem value="Selangor">Selangor</SelectItem>
                  {/* Add other states */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Submit</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

UserDetailsForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default UserDetailsForm;
