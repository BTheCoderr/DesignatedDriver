/**
 * Image optimization utilities
 * Uses Cloudinary for optimization and thumbnails
 */

import { 
  getOptimizedCloudinaryUrl, 
  getThumbnailUrl as getCloudinaryThumbnail,
  isCloudinaryUrl 
} from './cloudinary';

/**
 * Get optimized image URL for display
 * Uses Cloudinary transformations if URL is from Cloudinary
 */
export function getOptimizedImageUrl(originalUrl: string, options?: {
  width?: number;
  height?: number;
  quality?: number;
}): string {
  if (isCloudinaryUrl(originalUrl)) {
    return getOptimizedCloudinaryUrl(originalUrl, {
      width: options?.width,
      height: options?.height,
      quality: options?.quality || 80,
      format: 'auto', // Auto WebP/AVIF
    });
  }
  
  // Fallback to original URL if not Cloudinary
  return originalUrl;
}

/**
 * Get thumbnail URL for list views
 * Uses Cloudinary for optimized thumbnails
 */
export function getThumbnailUrl(originalUrl: string, size: number = 200): string {
  if (isCloudinaryUrl(originalUrl)) {
    return getCloudinaryThumbnail(originalUrl, size);
  }
  
  // Fallback to original URL if not Cloudinary
  return originalUrl;
}

/**
 * Validate image file size before upload
 */
export function validateImageSize(fileSize: number, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxSizeBytes;
}
