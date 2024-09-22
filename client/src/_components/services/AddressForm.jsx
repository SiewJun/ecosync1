import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { loadGoogleMaps } from '../../utils/googleMaps';

function AddressForm({ onAddressSelect, initialAddress }) {
  const addressInput = useRef(null);
  const [address, setAddress] = useState(initialAddress);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    loadGoogleMaps(() => {
      setMapsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (mapsLoaded) {
      const interval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(interval);
          if (addressInput.current) {
            autocompleteRef.current = new window.google.maps.places.Autocomplete(addressInput.current, {
              types: ['address'],
            });

            const handlePlaceChanged = () => {
              const place = autocompleteRef.current.getPlace();
              if (place && place.geometry) {
                onAddressSelect(place);
              } else {
                console.error('No geometry found for the selected place.');
              }
            };

            autocompleteRef.current.addListener('place_changed', handlePlaceChanged);

            return () => {
              if (autocompleteRef.current) {
                window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
              }
            };
          }
        }
      }, 100); // Check every 100ms
    }
  }, [mapsLoaded, onAddressSelect]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <span>Confirm Your Address</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Input
            ref={addressInput}
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Start typing your address..."
            className="pl-10"
          />
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </CardContent>
    </Card>
  );
} 

AddressForm.propTypes = {
  onAddressSelect: PropTypes.func.isRequired,
  initialAddress: PropTypes.string, // Add this line to validate initialAddress prop
};

export default AddressForm;