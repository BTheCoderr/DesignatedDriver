export type ServiceId = 'drive_my_car' | 'chauffeur' | 'vehicle_delivery' | 'book_a_ride' | 'scheduled_assistance' | 'business';
export type Service = { id: ServiceId; title: string; subtitle: string; icon: string; available: boolean; requiresCustomerVehicle: boolean; };

// Only the original drive-my-car booking has a wired trip lifecycle today.
export const SERVICES: readonly Service[] = [
  { id: 'drive_my_car', title: 'Drive My Car', subtitle: 'Your vehicle, our driver', icon: '🚗', available: true, requiresCustomerVehicle: true },
  { id: 'chauffeur', title: 'Personal Chauffeur', subtitle: 'Hourly and daily service', icon: '🕒', available: false, requiresCustomerVehicle: true },
  { id: 'vehicle_delivery', title: 'Vehicle Pickup', subtitle: 'Service, detailing and delivery', icon: '🔑', available: false, requiresCustomerVehicle: true },
  { id: 'book_a_ride', title: 'Book a Ride', subtitle: 'Ride in a provider vehicle', icon: '🚕', available: false, requiresCustomerVehicle: false },
  { id: 'scheduled_assistance', title: 'Scheduled Assistance', subtitle: 'Appointments and errands', icon: '📅', available: false, requiresCustomerVehicle: false },
  { id: 'business', title: 'Business Transport', subtitle: 'Transportation for teams', icon: '💼', available: false, requiresCustomerVehicle: false },
];

export const getService = (id: ServiceId): Service | undefined => SERVICES.find(service => service.id === id);
