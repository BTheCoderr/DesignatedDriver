// City density detection for dispatch logic
// Hardcoded for MVP - can be replaced with real geo later

export type CityDensity = 'high' | 'medium' | 'low' | 'suburban';

interface CityZone {
  name: string;
  density: CityDensity;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

// Hardcoded dense city zones (MVP approach)
const DENSE_CITY_ZONES: CityZone[] = [
  {
    name: 'New York City',
    density: 'high',
    bounds: { north: 40.9176, south: 40.4774, east: -73.7004, west: -74.2591 },
  },
  {
    name: 'Boston',
    density: 'high',
    bounds: { north: 42.3967, south: 42.2279, east: -70.8752, west: -71.1912 },
  },
  {
    name: 'Chicago',
    density: 'high',
    bounds: { north: 42.0231, south: 41.6445, east: -87.5237, west: -87.9401 },
  },
  {
    name: 'Miami',
    density: 'high',
    bounds: { north: 25.7907, south: 25.7098, east: -80.1300, west: -80.3195 },
  },
  {
    name: 'Los Angeles',
    density: 'high',
    bounds: { north: 34.3373, south: 33.7037, east: -118.1553, west: -118.6682 },
  },
  {
    name: 'San Francisco',
    density: 'high',
    bounds: { north: 37.8324, south: 37.6398, east: -122.2818, west: -122.5149 },
  },
  {
    name: 'Washington DC',
    density: 'high',
    bounds: { north: 38.9956, south: 38.7916, east: -76.9094, west: -77.1197 },
  },
  {
    name: 'Seattle',
    density: 'high',
    bounds: { north: 47.7341, south: 47.4955, east: -122.2044, west: -122.4597 },
  },
  {
    name: 'Providence, RI',
    density: 'high',
    bounds: { north: 41.8766, south: 41.7741, east: -71.3706, west: -71.4378 },
  },
];

// Default location: Providence, Rhode Island (starting market)
export const DEFAULT_LOCATION = {
  lat: 41.8240, // Providence, RI
  lng: -71.4128,
  address: 'Providence, RI',
  cityDensity: 'high' as CityDensity,
};

/**
 * Detects city density based on coordinates
 * Returns 'high' for dense cities, 'medium' for suburbs, 'low' for rural
 */
export function detectCityDensity(lat: number, lng: number): CityDensity {
  // Check if coordinates are within any dense city zone
  for (const zone of DENSE_CITY_ZONES) {
    if (
      lat >= zone.bounds.south &&
      lat <= zone.bounds.north &&
      lng >= zone.bounds.west &&
      lng <= zone.bounds.east
    ) {
      return zone.density;
    }
  }

  // Default to medium for unknown areas (can be improved with real geo data)
  return 'medium';
}

/**
 * Gets city name if in a known zone
 */
export function getCityName(lat: number, lng: number): string | null {
  for (const zone of DENSE_CITY_ZONES) {
    if (
      lat >= zone.bounds.south &&
      lat <= zone.bounds.north &&
      lng >= zone.bounds.west &&
      lng <= zone.bounds.east
    ) {
      return zone.name;
    }
  }
  return null;
}
