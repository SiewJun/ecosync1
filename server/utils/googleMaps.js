const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env file

const apiKey = process.env.GOOGLE_MAPS_API_KEY;

function geocodeAddress(address) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  
  return axios.get(url)
    .then(response => {
      if (response.data.status === 'OK' && response.data.results[0]) {
        const { lat, lng } = response.data.results[0].geometry.location;
        return { lat, lng };
      } else {
        throw new Error(response.data.status);
      }
    })
    .catch(error => {
      throw new Error(error.message);
    });
}

module.exports = { geocodeAddress };