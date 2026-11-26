import { SERVICES, type ServiceId } from './services';

export type GuestInquiry = {
  service: ServiceId;
  name: string;
  email: string;
  phone: string;
  pickup: string;
  destination: string;
  requestedFor: string;
  notes: string;
};

export function validateGuestInquiry(input: GuestInquiry, now = Date.now()): GuestInquiry {
  const value = { ...input, name: input.name.trim(), email: input.email.trim().toLowerCase(), phone: input.phone.trim(), pickup: input.pickup.trim(), destination: input.destination.trim(), notes: input.notes.trim() };
  if (!SERVICES.some(s => s.id === value.service)) throw new Error('Choose a transportation service.');
  if (value.name.length < 2 || value.name.length > 120) throw new Error('Enter your name.');
  if (value.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) throw new Error('Enter a valid email address.');
  if (value.phone.replace(/\D/g, '').length < 7 || value.phone.length > 40) throw new Error('Enter a valid contact number.');
  if ([value.pickup, value.destination].some(s => s.length < 3 || s.length > 500)) throw new Error('Enter complete pickup and destination addresses.');
  if (!/(Z|[+-]\d{2}:\d{2})$/.test(value.requestedFor)) throw new Error('Include the timezone in your requested time.');
  const time = Date.parse(value.requestedFor);
  if (!Number.isFinite(time) || time <= now) throw new Error('Choose a future date and time.');
  if (value.notes.length > 2000) throw new Error('Keep notes under 2,000 characters.');
  return { ...value, requestedFor: new Date(time).toISOString() };
}
