/**
 * DEMO CONFIGURATION
 * 
 * Use this to force dispatch modes for reliable demos.
 * 
 * IMPORTANT: Change this BEFORE recording/demoing, NOT live on screen.
 * 
 * Set to:
 * - "solo_scoot" → Force Solo-Scoot mode
 * - "chase_car" → Force Chase Car mode  
 * - null → Use normal dispatch logic
 */

export const DEMO_FORCE_MODE: "solo_scoot" | "chase_car" | null = null;

/**
 * Demo reason (shown in UI for transparency during demos)
 */
export const DEMO_MODE_REASON = "demo_override";

/**
 * Providence Demo Locations
 * Pre-configured addresses for reliable demos
 */
export const PROVIDENCE_DEMO_LOCATIONS = {
  solo_scoot: {
    pickup: {
      address: "1 Kennedy Plaza, Providence, RI",
      lat: 41.8268,
      lng: -71.4114,
      description: "Downtown Providence - Dense core"
    },
    destination: {
      address: "Atwells Ave, Federal Hill, Providence, RI",
      lat: 41.8230,
      lng: -71.4210,
      description: "Federal Hill - Nightlife district"
    }
  },
  chase_car: {
    pickup: {
      address: "Garden City Center, Cranston, RI",
      lat: 41.7600,
      lng: -71.4500,
      description: "Suburban shopping center"
    },
    destination: {
      address: "East Greenwich, RI",
      lat: 41.6600,
      lng: -71.4500,
      description: "Suburban destination"
    }
  }
};

/**
 * Check if demo mode is active
 */
export function isDemoMode(): boolean {
  return DEMO_FORCE_MODE !== null;
}

/**
 * Get demo mode (if active)
 */
export function getDemoMode(): "solo_scoot" | "chase_car" | null {
  return DEMO_FORCE_MODE;
}
