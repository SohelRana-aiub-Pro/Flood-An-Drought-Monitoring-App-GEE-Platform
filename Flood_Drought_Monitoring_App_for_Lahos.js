//import os

// ==========================
// Flood & Drought Monitoring App for Lahos (2016)
// ==========================

// 1. Load FAO GAUL dataset (Country boundaries)
var countries = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level0");

// Filter for Lahos country by name
var lahos = countries.filter(ee.Filter.eq('ADM0_NAME', 'Lahos'));

// Define ROI
var roi = lahos.geometry();

// ==========================
// 2. Flood Mapping (Sentinel-1 SAR)
// ==========================
var s1 = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterBounds(roi)
  .filterDate('2016-06-01', '2016-09-30')
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .select('VV');

var s1_median = s1.median();
var floodMask = s1_median.lt(-17).selfMask(); // threshold for water

// ==========================
// 3. Drought Mapping (CHIRPS Rainfall Anomaly)
// ==========================
var chirps = ee.ImageCollection('UCSB-CHG/CHIRPS/PENTAD')
  .filterBounds(roi)
  .filterDate('2016-01-01', '2016-12-31');

var meanRain = chirps.mean();
var droughtMask = meanRain.lt(50).selfMask(); // rainfall anomaly threshold

// ==========================
// 4. Population Exposure (WorldPop)
// ==========================
var population = ee.ImageCollection("WorldPop/GP/100m/pop")
  .filterDate('2016-01-01', '2016-12-31')
  .mean()
  .clip(roi);

var affectedPopFlood = population.updateMask(floodMask);
var affectedPopDrought = population.updateMask(droughtMask);

// ==========================
// 5. Cropland Loss (ESA WorldCover)
// ==========================
var cropland = ee.ImageCollection("ESA/WorldCover/v100")
  .first()
  .select('Map')
  .eq(40) // cropland class
  .selfMask()
  .clip(roi);

var croplandFloodLoss = cropland.updateMask(floodMask);
var croplandDroughtLoss = cropland.updateMask(droughtMask);

// ==========================
// 6. UI Components
// ==========================

// Title
var title = ui.Label('🌍 Lahos Hazard Monitoring (2016)', {fontSize: '24px', color: 'blue'});
ui.root.widgets().add(title);

// Dropdown for hazard type
var hazardSelect = ui.Select({
  items: ['Floods', 'Droughts', 'Cropland Loss', 'Affected People'],
  placeholder: 'Select Hazard',
  onChange: function(hazard) {
    Map.clear();
    Map.centerObject(roi, 6);
    if (hazard === 'Floods') {
      Map.addLayer(floodMask, {palette:['blue']}, 'Flood Extent');
      summary.setValue('Floods in 2016 affected large areas of Lahos.');
    } else if (hazard === 'Droughts') {
      Map.addLayer(droughtMask, {palette:['red']}, 'Drought Zones');
      summary.setValue('Droughts in 2016 reduced rainfall significantly.');
    } else if (hazard === 'Cropland Loss') {
      Map.addLayer(croplandFloodLoss, {palette:['blue']}, 'Flooded Cropland');
      Map.addLayer(croplandDroughtLoss, {palette:['red']}, 'Drought Cropland');
      summary.setValue('Cropland losses due to floods and droughts in 2016.');
    } else if (hazard === 'Affected People') {
      Map.addLayer(affectedPopFlood, {min:0, max:1000, palette:['yellow','orange','red']}, 'Flood Affected Population');
      Map.addLayer(affectedPopDrought, {min:0, max:1000, palette:['pink','purple']}, 'Drought Affected Population');
      summary.setValue('Population exposure to floods and droughts in 2016.');
    }
  }
});
ui.root.widgets().add(hazardSelect);

// Summary Panel
var summary = ui.Label('Select a hazard to view impacts.');
ui.root.widgets().add(summary);

// Chart Example: Rainfall anomaly over time
var chart = ui.Chart.image.series({
  imageCollection: chirps,
  region: roi,
  reducer: ee.Reducer.mean(),
  scale: 10000
}).setOptions({title: 'Rainfall Anomaly (2016)', vAxis: {title: 'Rainfall (mm)'}});
ui.root.widgets().add(chart);

// ==========================
// Initial Map View
// ==========================
Map.centerObject(roi, 6);
Map.addLayer(s1_median, {min:-25, max:0}, 'Sentinel-1 VV');

//