project_Code_Structure_Flood_and_Drought_Monitoring/
│
├── data/
│   ├── boundaries.js        # Load FAO GAUL country boundaries (Lahos)
│   ├── sentinel1.js         # Load and preprocess Sentinel-1 SAR data
│   ├── chirps.js            # Load CHIRPS rainfall anomaly data
│   ├── worldpop.js          # Load WorldPop population data
│   ├── cropland.js          # Load ESA WorldCover cropland data
│
├── analysis/
│   ├── flood.js             # Flood detection (thresholding, masks)
│   ├── drought.js           # Drought detection (rainfall anomaly masks)
│   ├── population.js        # Overlay hazards with population exposure
│   ├── croplandLoss.js      # Overlay hazards with cropland loss
│   └── statistics.js        # Compute summary statistics (area, people affected)
│
├── ui/
│   ├── mapLayers.js         # Functions to add map layers (floods, droughts, etc.)
│   ├── charts.js            # Functions to generate charts (rainfall anomaly, exposure)
│   ├── panels.js            # UI panels (title, summary, dropdowns)
│   └── app.js               # Main UI logic (hazard selection, event handlers)
│
├── main.js                  # Entry point: imports modules, initializes app
└── README.md                # Documentation for developers & users