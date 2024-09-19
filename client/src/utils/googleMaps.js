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
      if (callback) callback();
    };

    script.onerror = () => {
      console.error("Failed to load the Google Maps script.");
    };
  } else if (callback) {
    callback();
  }
}
