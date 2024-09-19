import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Home, Building, DollarSign } from "lucide-react";
import { loadGoogleMaps } from '@/utils/googleMaps';

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

  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    loadGoogleMaps(() => {
      initializeAutocomplete();
    });
  }, []);

  const initializeAutocomplete = () => {
    if (window.google && addressInputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        componentRestrictions: { country: 'MY' },
        fields: ['address_components', 'formatted_address', 'geometry'],
      });

      autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
    }
  };

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    if (!place.geometry) {
      console.log("Returned place contains no geometry");
      return;
    }

    const address = place.formatted_address;
    let state = '';

    // Extract state from address components
    for (const component of place.address_components) {
      if (component.types.includes('administrative_area_level_1')) {
        state = component.long_name;
        break;
      }
    }

    setFormData(prev => ({
      ...prev,
      address: address,
      state: state
    }));
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-primary p-6">
        <CardTitle className="text-3xl font-bold">Personal Details</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="salutation" className="text-sm font-medium text-gray-700">Salutation</Label>
              <Select id="salutation" name="salutation" onValueChange={(value) => handleChange('salutation', value)} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mr">Mr.</SelectItem>
                  <SelectItem value="Mrs">Mrs.</SelectItem>
                  <SelectItem value="Ms">Ms.</SelectItem>
                  <SelectItem value="Dr">Dr.</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <motion.div variants={inputVariants} whileFocus="focus">
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="pl-10 w-full"
                    placeholder="Full Name"
                    required
                    autoComplete="name"
                  />
                </motion.div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <motion.div variants={inputVariants} whileFocus="focus">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="pl-10 w-full"
                  placeholder="Email Address"
                  required
                  autoComplete="email"
                />
              </motion.div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <motion.div variants={inputVariants} whileFocus="focus">
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="pl-10 w-full"
                  placeholder="Phone Number"
                  required
                  autoComplete="tel"
                />
              </motion.div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="avgElectricityBill" className="text-sm font-medium text-gray-700">Average Monthly Electricity Bill (RM)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <motion.div variants={inputVariants} whileFocus="focus">
                <Input
                  id="avgElectricityBill"
                  name="avgElectricityBill"
                  type="number"
                  value={formData.avgElectricityBill}
                  onChange={(e) => handleChange('avgElectricityBill', e.target.value)}
                  className="pl-10 w-full"
                  placeholder="e.g. 200"
                  required
                  autoComplete="off"
                />
              </motion.div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <motion.div variants={inputVariants} whileFocus="focus">
                <Input
                  id="address"
                  name="address"
                  ref={addressInputRef}
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="pl-10 w-full"
                  placeholder="Start typing your address"
                  required
                  autoComplete="street-address"
                />
              </motion.div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="propertyType" className="text-sm font-medium text-gray-700">Property Type</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Select id="propertyType" name="propertyType" onValueChange={(value) => handleChange('propertyType', value)} required>
                  <SelectTrigger className="pl-10 w-full">
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
              <Label htmlFor="state" className="text-sm font-medium text-gray-700">State</Label>
              <Select id="state" name="state" value={formData.state} onValueChange={(value) => handleChange('state', value)} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Johor">Johor</SelectItem>
                  <SelectItem value="Kedah">Kedah</SelectItem>
                  <SelectItem value="Kelantan">Kelantan</SelectItem>
                  <SelectItem value="Melaka">Melaka</SelectItem>
                  <SelectItem value="Negeri Sembilan">Negeri Sembilan</SelectItem>
                  <SelectItem value="Pahang">Pahang</SelectItem>
                  <SelectItem value="Perak">Perak</SelectItem>
                  <SelectItem value="Perlis">Perlis</SelectItem>
                  <SelectItem value="Pulau Pinang">Pulau Pinang</SelectItem>
                  <SelectItem value="Sabah">Sabah</SelectItem>
                  <SelectItem value="Sarawak">Sarawak</SelectItem>
                  <SelectItem value="Selangor">Selangor</SelectItem>
                  <SelectItem value="Terengganu">Terengganu</SelectItem>
                  <SelectItem value="Kuala Lumpur">Kuala Lumpur</SelectItem>
                  <SelectItem value="Labuan">Labuan</SelectItem>
                  <SelectItem value="Putrajaya">Putrajaya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-6 py-4">
          <motion.div
            className="w-full"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              className="w-full font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out"
            >
              Submit and Continue
            </Button>
          </motion.div>
        </CardFooter>
      </form>
    </Card>
  );
};

UserDetailsForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default UserDetailsForm;