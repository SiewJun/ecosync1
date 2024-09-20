const express = require("express");
const router = express.Router();
const { User, CompanyDetail, CompanyProfile } = require("../models");
const authenticateToken = require("../middleware/auth");
const { geocodeAddress } = require("../utils/googleMaps");

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

router.get("/nearby-companies", async (req, res) => {
  try {
    const { address, radius = 50 } = req.query; // radius in km, default 50km

    if (!address) {
      return res.status(400).json({ error: "User address is required" });
    }

    // Geocode user address
    const userLocation = await geocodeAddress(address);
    if (!userLocation) {
      return res.status(400).json({ error: "Unable to geocode user address" });
    }

    // Fetch all companies
    const companies = await User.findAll({
      where: { role: 'COMPANY' },
      include: [
        { model: CompanyDetail },
        { model: CompanyProfile }
      ]
    });

    // Calculate distances and filter nearby companies
    const nearbyCompanies = await Promise.all(companies.map(async (company) => {
      const companyLocation = await geocodeAddress(company.CompanyDetail.address);
      if (!companyLocation) return null;

      const distance = calculateDistance(
        userLocation.lat, userLocation.lng,
        companyLocation.lat, companyLocation.lng
      );

      return { ...company.toJSON(), distance };
    }));

    // Filter out null results, sort by distance, and limit to top 5
    const filteredCompanies = nearbyCompanies
      .filter(company => company && company.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    res.json(filteredCompanies);
  } catch (error) {
    console.error("Error fetching nearby companies:", error);
    res.status(500).json({ error: "Failed to fetch nearby companies" });
  }
});

module.exports = router;