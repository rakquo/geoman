export const continents = {
  asia: {
    name: "Asia",
    center: [80, 35],
    scale: 350,
    countries: ["CHN", "IND", "JPN", "KOR", "PRK", "MNG", "KAZ", "UZB", "TKM", "TJK", "KGZ", "AFG", "PAK", "BGD", "LKA", "NPL", "BTN", "MMR", "THA", "VNM", "LAO", "KHM", "MYS", "IDN", "PHL", "SGP", "BRN", "TLS", "IRQ", "IRN", "SYR", "JOR", "LBN", "ISR", "PSE", "SAU", "YEM", "OMN", "ARE", "QAT", "BHR", "KWT", "GEO", "ARM", "AZE", "TUR"],
    color: "#E8E4DA",
    bounds: [[25, -10], [150, 75]],
  },
  europe: {
    name: "Europe",
    center: [15, 52],
    scale: 600,
    countries: ["GBR", "FRA", "DEU", "ITA", "ESP", "PRT", "NLD", "BEL", "LUX", "CHE", "AUT", "POL", "CZE", "SVK", "HUN", "ROU", "BGR", "GRC", "SRB", "HRV", "SVN", "BIH", "MNE", "MKD", "ALB", "NOR", "SWE", "FIN", "DNK", "EST", "LVA", "LTU", "BLR", "UKR", "MDA", "IRL", "ISL"],
    color: "#E8E4DA",
    bounds: [[-25, 35], [45, 72]],
  },
  africa: {
    name: "Africa",
    center: [20, 0],
    scale: 350,
    countries: ["DZA", "AGO", "BEN", "BWA", "BFA", "BDI", "CMR", "CPV", "CAF", "TCD", "COM", "COG", "COD", "CIV", "DJI", "EGY", "GNQ", "ERI", "ETH", "GAB", "GMB", "GHA", "GIN", "GNB", "KEN", "LSO", "LBR", "LBY", "MDG", "MWI", "MLI", "MRT", "MUS", "MAR", "MOZ", "NAM", "NER", "NGA", "RWA", "STP", "SEN", "SYC", "SLE", "SOM", "ZAF", "SSD", "SDN", "SWZ", "TZA", "TGO", "TUN", "UGA", "ZMB", "ZWE"],
    color: "#E8E4DA",
    bounds: [[-20, -37], [55, 38]],
  },
  "north-america": {
    name: "North America",
    center: [-100, 45],
    scale: 300,
    countries: ["USA", "CAN", "MEX", "GTM", "BLZ", "HND", "SLV", "NIC", "CRI", "PAN", "CUB", "JAM", "HTI", "DOM", "TTO", "BHS", "BRB", "GRD", "ATG", "DMA", "KNA", "LCA", "VCT"],
    color: "#E8E4DA",
    bounds: [[-170, 7], [-50, 84]],
  },
  "south-america": {
    name: "South America",
    center: [-60, -15],
    scale: 350,
    countries: ["BRA", "ARG", "CHL", "COL", "PER", "VEN", "ECU", "BOL", "PRY", "URY", "GUY", "SUR"],
    color: "#E8E4DA",
    bounds: [[-82, -56], [-34, 13]],
  },
  oceania: {
    name: "Oceania",
    center: [140, -25],
    scale: 400,
    countries: ["AUS", "NZL", "PNG", "FJI", "SLB", "VUT", "WSM", "TON", "FSM", "PLW", "MHL", "KIR", "NRU", "TUV"],
    color: "#E8E4DA",
    bounds: [[110, -50], [180, 0]],
  },
};

// Mapping from ISO country code to continent id
export const countryToContinent = {};
Object.entries(continents).forEach(([id, data]) => {
  data.countries.forEach(code => {
    countryToContinent[code] = id;
  });
});
