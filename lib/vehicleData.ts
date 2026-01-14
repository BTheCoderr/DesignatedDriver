// Vehicle data for dropdowns - standardized for insurance

export const CAR_MAKES = [
  'Acura',
  'Audi',
  'BMW',
  'Buick',
  'Cadillac',
  'Chevrolet',
  'Chrysler',
  'Dodge',
  'Ford',
  'Genesis',
  'GMC',
  'Honda',
  'Hyundai',
  'Infiniti',
  'Jeep',
  'Kia',
  'Lexus',
  'Lincoln',
  'Mazda',
  'Mercedes-Benz',
  'Mitsubishi',
  'Nissan',
  'Ram',
  'Subaru',
  'Tesla',
  'Toyota',
  'Volkswagen',
  'Volvo',
] as const;

export type CarMake = typeof CAR_MAKES[number];

// Models by make
export const CAR_MODELS: Record<CarMake, string[]> = {
  'Acura': ['ILX', 'TLX', 'RLX', 'RDX', 'MDX', 'NSX'],
  'Audi': ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'TT'],
  'BMW': ['2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', '8 Series', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4', 'iX', 'i4'],
  'Buick': ['Encore', 'Encore GX', 'Envision', 'Enclave'],
  'Cadillac': ['CT4', 'CT5', 'CT6', 'XT4', 'XT5', 'XT6', 'Escalade'],
  'Chevrolet': ['Spark', 'Sonic', 'Cruze', 'Malibu', 'Impala', 'Camaro', 'Corvette', 'Trax', 'Trailblazer', 'Equinox', 'Blazer', 'Traverse', 'Tahoe', 'Suburban', 'Silverado', 'Colorado'],
  'Chrysler': ['300', 'Pacifica', 'Voyager'],
  'Dodge': ['Charger', 'Challenger', 'Durango', 'Journey', 'Grand Caravan'],
  'Ford': ['Fiesta', 'Focus', 'Fusion', 'Mustang', 'EcoSport', 'Escape', 'Edge', 'Explorer', 'Expedition', 'F-150', 'F-250', 'F-350', 'Ranger'],
  'Genesis': ['G70', 'G80', 'G90', 'GV70', 'GV80'],
  'GMC': ['Terrain', 'Acadia', 'Yukon', 'Sierra 1500', 'Sierra 2500', 'Sierra 3500'],
  'Honda': ['Civic', 'Accord', 'Insight', 'Clarity', 'CR-V', 'HR-V', 'Passport', 'Pilot', 'Ridgeline', 'Odyssey'],
  'Hyundai': ['Accent', 'Elantra', 'Sonata', 'Ioniq', 'Kona', 'Tucson', 'Santa Fe', 'Palisade', 'Venue', 'Veloster'],
  'Infiniti': ['Q50', 'Q60', 'Q70', 'QX50', 'QX55', 'QX60', 'QX80'],
  'Jeep': ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Gladiator', 'Wagoneer'],
  'Kia': ['Rio', 'Forte', 'K5', 'Stinger', 'Soul', 'Seltos', 'Sportage', 'Sorento', 'Telluride', 'Carnival'],
  'Lexus': ['IS', 'ES', 'GS', 'LS', 'UX', 'NX', 'RX', 'GX', 'LX', 'RC', 'LC'],
  'Lincoln': ['Corsair', 'Nautilus', 'Aviator', 'Navigator'],
  'Mazda': ['Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-9', 'MX-5 Miata'],
  'Mercedes-Benz': ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'CLA', 'CLS', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class', 'EQC', 'EQS'],
  'Mitsubishi': ['Mirage', 'Outlander', 'Outlander Sport', 'Eclipse Cross'],
  'Nissan': ['Versa', 'Sentra', 'Altima', 'Maxima', 'Kicks', 'Rogue', 'Rogue Sport', 'Murano', 'Pathfinder', 'Armada', 'Frontier', 'Titan'],
  'Ram': ['1500', '2500', '3500', 'ProMaster', 'ProMaster City'],
  'Subaru': ['Impreza', 'Legacy', 'WRX', 'Crosstrek', 'Forester', 'Outback', 'Ascent'],
  'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck'],
  'Toyota': ['Corolla', 'Camry', 'Prius', 'Avalon', 'C-HR', 'RAV4', 'Highlander', '4Runner', 'Sequoia', 'Land Cruiser', 'Tacoma', 'Tundra', 'Sienna'],
  'Volkswagen': ['Jetta', 'Passat', 'Arteon', 'Atlas', 'Atlas Cross Sport', 'Tiguan', 'ID.4'],
  'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90'],
};

// Generate years (last 35 years to current year + 1)
export const CAR_YEARS = (() => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 34; // 35 years total
  const years: number[] = [];
  for (let year = currentYear + 1; year >= startYear; year--) {
    years.push(year);
  }
  return years;
})();

// Standard vehicle colors
export const CAR_COLORS = [
  'White',
  'Black',
  'Silver',
  'Gray',
  'Red',
  'Blue',
  'Green',
  'Brown',
  'Beige',
  'Gold',
  'Orange',
  'Yellow',
  'Purple',
  'Pink',
  'Maroon',
  'Navy',
  'Teal',
  'Burgundy',
  'Tan',
  'Cream',
] as const;

export type CarColor = typeof CAR_COLORS[number];

// Helper function to get models for a make
export function getModelsForMake(make: CarMake | ''): string[] {
  if (!make || !CAR_MODELS[make]) return [];
  return CAR_MODELS[make];
}
