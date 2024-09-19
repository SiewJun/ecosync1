// Calculate the number of solar panels based on the area
export function calculatePanels(area, panelSize = 1.7) {
  return Math.floor(area / panelSize);
}

// Calculate panels needed for a given kWp
export function calculatePanelsForKWp(kWp, panelWattage = 300) {
  return Math.ceil((kWp * 1000) / panelWattage); // Convert kWp to watts and divide by panel wattage
}

// Refined solar savings calculation
export function calculateSavings(
  avgElectricityBill,
  panelCount,
  avgSunHours = 5,
  systemPerformanceRatio = 0.75, 
  panelWattage = 300,
  electricityRate = 0.52 
) {
  avgElectricityBill = parseFloat(avgElectricityBill);
  panelCount = parseInt(panelCount, 10);

  const energyPerPanelPerDay = (panelWattage / 1000) * avgSunHours * systemPerformanceRatio;
  const monthlyProduction = energyPerPanelPerDay * panelCount * 30;
  const estimatedSavings = monthlyProduction * electricityRate;

  // Cap the new bill and savings to ensure they don't go below 0 or exceed the original bill
  const newBill = Math.max(0, avgElectricityBill - estimatedSavings);
  const annualSavings = Math.min(estimatedSavings * 12, avgElectricityBill * 12); // Cap at the annual bill

  const recommendedKWp = Math.min(
    panelCount * (panelWattage / 1000),
    avgElectricityBill / (electricityRate * 30 * avgSunHours * systemPerformanceRatio)
  );

  const panelsForRecommendedKWp = calculatePanelsForKWp(recommendedKWp, panelWattage);

  const coversFullBill = estimatedSavings >= avgElectricityBill;

  // Calculate percentage saved based on capped annual savings
  const percentageSaved = ((annualSavings / (avgElectricityBill * 12)) * 100).toFixed(2);

  return {
    oldBill: avgElectricityBill.toFixed(2),
    newBill: newBill.toFixed(2),
    recommendedKWp: recommendedKWp.toFixed(1),
    panelsForRecommendedKWp,
    coversFullBill,
    maxPanelCount: panelCount,
    annualSavings: annualSavings.toFixed(2),
    percentageSaved: Math.min(percentageSaved, 100) // Ensure percentage doesn't exceed 100%
  };
}
