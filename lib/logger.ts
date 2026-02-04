/**
 * Logger utility for demo mode
 * Disables console logs when EXPO_PUBLIC_DEMO_MODE=true
 */

const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';

export const log = (...args: any[]) => {
  if (!DEMO_MODE) {
    console.log(...args);
  }
};

export const warn = (...args: any[]) => {
  if (!DEMO_MODE) {
    console.warn(...args);
  }
};

export const error = (...args: any[]) => {
  // Always show errors, even in demo mode
  console.error(...args);
};

export const info = (...args: any[]) => {
  if (!DEMO_MODE) {
    console.info(...args);
  }
};

export const debug = (...args: any[]) => {
  if (!DEMO_MODE) {
    console.debug(...args);
  }
};
