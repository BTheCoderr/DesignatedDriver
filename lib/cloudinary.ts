/**
 * Cloudinary Image Upload & Optimization
 * Handles image uploads to Cloudinary and provides optimized URLs
 * 
 * SETUP REQUIRED:
 * 1. Go to Cloudinary Dashboard → Settings → Upload → Upload Presets
 * 2. Create an unsigned upload preset named "designated_driver_unsigned"
 * 3. Set folder to "designated-driver" (optional)
 * 4. Enable "Use filename" if you want custom public_ids
 */

const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'designated_driver_unsigned';

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Upload image to Cloudinary using unsigned upload preset
 * Returns the secure URL of the uploaded image
 */
export async function uploadToCloudinary(
  imageUri: string,
  folder: string = 'designated-driver',
  options?: {
    publicId?: string;
    quality?: number;
    width?: number;
    height?: number;
  }
): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary cloud name not configured. Set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME in .env');
  }

  if (!CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary upload preset not configured. Create an unsigned preset and set EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
  }

  const formData = new FormData();
  
  // Handle web vs native FormData differently
  let fileToUpload: File | Blob | { uri: string; type: string; name: string };
  
  if (typeof window !== 'undefined') {
    // Web: Convert image URI to File/Blob
    try {
      let blob: Blob;
      let detectedType = 'image/jpeg'; // Default fallback
      let fileExtension = 'jpg'; // Default fallback
      
      // Handle blob URLs (from expo-image-picker on web)
      if (imageUri.startsWith('blob:')) {
        const response = await fetch(imageUri);
        blob = await response.blob();
        detectedType = blob.type || 'image/jpeg';
        // Determine extension from MIME type
        if (detectedType.includes('png')) fileExtension = 'png';
        else if (detectedType.includes('jpeg') || detectedType.includes('jpg')) fileExtension = 'jpg';
        else if (detectedType.includes('webp')) fileExtension = 'webp';
        else if (detectedType.includes('gif')) fileExtension = 'gif';
      } 
      // Handle data URLs
      else if (imageUri.startsWith('data:')) {
        const response = await fetch(imageUri);
        blob = await response.blob();
        detectedType = blob.type || imageUri.split(';')[0].split(':')[1] || 'image/jpeg';
        if (detectedType.includes('png')) fileExtension = 'png';
        else if (detectedType.includes('jpeg') || detectedType.includes('jpg')) fileExtension = 'jpg';
        else if (detectedType.includes('webp')) fileExtension = 'webp';
        else if (detectedType.includes('gif')) fileExtension = 'gif';
      } 
      // Handle regular HTTP URLs
      else if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
        const response = await fetch(imageUri);
        blob = await response.blob();
        detectedType = blob.type || 'image/jpeg';
        // Try to get extension from URL
        const urlMatch = imageUri.match(/\.(png|jpg|jpeg|webp|gif)/i);
        if (urlMatch) fileExtension = urlMatch[1].toLowerCase();
        else if (detectedType.includes('png')) fileExtension = 'png';
        else if (detectedType.includes('jpeg') || detectedType.includes('jpg')) fileExtension = 'jpg';
        else if (detectedType.includes('webp')) fileExtension = 'webp';
        else if (detectedType.includes('gif')) fileExtension = 'gif';
      } 
      // For web, if it's not a URL, throw error
      else {
        throw new Error('Invalid image URI format for web');
      }
      
      // Use publicId if provided, otherwise generate filename with correct extension
      const fileName = options?.publicId 
        ? `${options.publicId}.${fileExtension}`
        : `photo-${Date.now()}.${fileExtension}`;
      fileToUpload = new File([blob], fileName, { type: detectedType });
    } catch (error) {
      console.error('Error converting image for web upload:', error);
      throw new Error(`Failed to prepare image for upload: ${error}`);
    }
  } else {
    // Native: Use React Native FormData format
    // Try to detect type from URI extension
    let detectedType = 'image/jpeg';
    let fileExtension = 'jpg';
    if (imageUri.toLowerCase().includes('.png')) {
      detectedType = 'image/png';
      fileExtension = 'png';
    } else if (imageUri.toLowerCase().includes('.jpg') || imageUri.toLowerCase().includes('.jpeg')) {
      detectedType = 'image/jpeg';
      fileExtension = 'jpg';
    } else if (imageUri.toLowerCase().includes('.webp')) {
      detectedType = 'image/webp';
      fileExtension = 'webp';
    }
    
    fileToUpload = {
      uri: imageUri,
      type: detectedType,
      name: `photo.${fileExtension}`,
    } as any;
  }
  
  // @ts-ignore - FormData accepts different formats for web/native
  formData.append('file', fileToUpload);
  
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);
  
  if (options?.publicId) {
    formData.append('public_id', options.publicId);
  }
  
  // Note: For unsigned uploads, format and quality must be set in the upload preset, not here
  // Transformations are applied on-the-fly when displaying using getOptimizedCloudinaryUrl()

  try {
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - React Native will set it with boundary
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload error response:', errorText);
      throw new Error(`Cloudinary upload failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.secure_url) {
      throw new Error('Cloudinary upload succeeded but no URL returned');
    }
    
    return data.secure_url;
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
}

/**
 * Get optimized image URL from Cloudinary
 * Transforms the image on-the-fly for better performance
 */
export function getOptimizedCloudinaryUrl(
  cloudinaryUrl: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  }
): string {
  if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary.com')) {
    // Not a Cloudinary URL, return as-is
    return cloudinaryUrl;
  }

  // Extract the public_id from the URL
  // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
  const urlParts = cloudinaryUrl.split('/upload/');
  if (urlParts.length !== 2) {
    return cloudinaryUrl; // Invalid format, return as-is
  }

  const [baseUrl, path] = urlParts;
  const transformations: string[] = [];

  if (options?.width) {
    transformations.push(`w_${options.width}`);
  }
  if (options?.height) {
    transformations.push(`h_${options.height}`);
  }
  if (options?.quality) {
    transformations.push(`q_${options.quality}`);
  }
  if (options?.format) {
    transformations.push(`f_${options.format}`);
  }

  // Add auto-format and quality if not specified
  if (!options?.format) {
    transformations.push('f_auto'); // Auto WebP/AVIF when supported
  }
  if (!options?.quality) {
    transformations.push('q_auto'); // Auto quality
  }

  const transformString = transformations.length > 0 
    ? `${transformations.join(',')}/`
    : '';

  return `${baseUrl}/upload/${transformString}${path}`;
}

/**
 * Get thumbnail URL (optimized for list views)
 */
export function getThumbnailUrl(cloudinaryUrl: string, size: number = 200): string {
  return getOptimizedCloudinaryUrl(cloudinaryUrl, {
    width: size,
    height: size,
    quality: 80,
    format: 'auto',
  });
}

/**
 * Check if URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('cloudinary.com');
}
