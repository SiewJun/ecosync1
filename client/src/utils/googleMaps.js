import apiKeys from './apiKeys';

export function loadGoogleMaps(callback) {
  const existingScript = document.getElementById('googleMaps');

  if (!existingScript) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKeys.googleMapsAPI}&libraries=places,drawing,geometry`;
    script.id = 'googleMaps';
    script.async = true; 
    script.defer = true; 
    document.body.appendChild(script);

    script.onload = () => {
      console.log("Google Maps API loaded successfully.");
      if (callback) callback();
    };

    script.onerror = () => {
      console.error("Failed to load the Google Maps script.");
      alert("Failed to load Google Maps API. Please refresh the page or try again later.");
    };
  } else if (callback) {
    callback();
  }
}

export function geocodeAddress(address) {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      return reject("Google Maps API is not loaded.");
    }

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const { lat, lng } = results[0].geometry.location;
        resolve({ lat: lat(), lng: lng() });
      } else {
        reject(status);
      }
    });
  });
}

