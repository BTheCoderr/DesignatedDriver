// Analytics logging utility
// Logs key events for YC metrics: signup, request, completion

import { supabase } from './supabase';

export type AnalyticsEvent = 
  | 'signup'
  | 'login'
  | 'trip_requested'
  | 'trip_dispatched'
  | 'trip_started'
  | 'trip_completed'
  | 'trip_cancelled'
  | 'damage_claim_submitted'
  | 'driver_gear_uploaded'
  | 'driver_gear_verified';

export interface AnalyticsData {
  event: AnalyticsEvent;
  userId?: string;
  tripId?: string;
  metadata?: Record<string, any>;
}

// Log analytics event
export async function logEvent(data: AnalyticsData) {
  try {
    // In production, you'd send to analytics service (Mixpanel, Amplitude, etc.)
    // For MVP, we'll log to console and optionally store in Supabase
    
    const logData = {
      event: data.event,
      user_id: data.userId || null,
      trip_id: data.tripId || null,
      metadata: data.metadata || {},
      timestamp: new Date().toISOString(),
    };

    // Console log for development
    console.log('[Analytics]', logData);

    // Optionally store in Supabase analytics table (if you create one)
    // For now, we'll just log to console
    // This is sufficient for YC demo - they just need to see you're tracking metrics
    
    return true;
  } catch (error) {
    console.error('Analytics error:', error);
    return false;
  }
}

// Helper functions for common events
export async function logSignup(userId: string) {
  return logEvent({ event: 'signup', userId });
}

export async function logLogin(userId: string) {
  return logEvent({ event: 'login', userId });
}

export async function logTripRequested(tripId: string, userId: string, metadata?: Record<string, any>) {
  return logEvent({ 
    event: 'trip_requested', 
    tripId, 
    userId,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
    }
  });
}

export async function logTripDispatched(tripId: string, metadata?: Record<string, any>) {
  return logEvent({ 
    event: 'trip_dispatched', 
    tripId,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
    }
  });
}

export async function logTripStarted(tripId: string, metadata?: Record<string, any>) {
  return logEvent({ 
    event: 'trip_started', 
    tripId,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
    }
  });
}

export async function logTripCompleted(tripId: string, userId: string, metadata?: Record<string, any>) {
  return logEvent({ 
    event: 'trip_completed', 
    tripId, 
    userId,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
    }
  });
}

export async function logTripCancelled(tripId: string, userId: string) {
  return logEvent({ event: 'trip_cancelled', tripId, userId });
}

export async function logDamageClaim(tripId: string, userId: string) {
  return logEvent({ event: 'damage_claim_submitted', tripId, userId });
}

export async function logDriverGearUploaded(driverId: string) {
  return logEvent({ event: 'driver_gear_uploaded', userId: driverId });
}

export async function logDriverGearVerified(driverId: string) {
  return logEvent({ event: 'driver_gear_verified', userId: driverId });
}
