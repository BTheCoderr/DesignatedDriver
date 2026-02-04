/**
 * Unified Image Upload Utility
 * Supports both Cloudinary and Supabase Storage
 * Cloudinary is preferred for optimization, Supabase as fallback
 */

import { supabase } from './supabase';
import { uploadToCloudinary } from './cloudinary';

const USE_CLOUDINARY = !!process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Upload image - uses Cloudinary if configured, otherwise Supabase Storage
 */
export async function uploadImage(
  imageUri: string,
  bucket: 'driver-gear-photos' | 'trunk-photos' | 'damage-claims' | 'vehicle-inspections',
  options?: {
    userId?: string;
    tripId?: string;
    folder?: string;
    publicId?: string;
  }
): Promise<string> {
  // Try Cloudinary first if configured
  if (USE_CLOUDINARY) {
    try {
      const folder = options?.folder || `designated-driver/${bucket}`;
      const publicId = options?.publicId || `${bucket}-${options?.userId || 'user'}-${Date.now()}`;
      
      const cloudinaryUrl = await uploadToCloudinary(imageUri, folder, {
        publicId,
        quality: 85, // Good balance of quality and file size
      });
      
      console.log(`✅ Image uploaded to Cloudinary: ${cloudinaryUrl}`);
      return cloudinaryUrl;
    } catch (error) {
      console.warn('⚠️ Cloudinary upload failed, falling back to Supabase:', error);
      // Fall through to Supabase Storage
    }
  }

  // Fallback to Supabase Storage
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !options?.userId) {
    throw new Error('Not authenticated');
  }

  const userId = options?.userId || user!.id;
  // Filename base (extension will be added based on detected image type)
  const filenameBase = `${bucket}-${options?.tripId || userId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  // Handle web vs native FormData differently
  let fileToUpload: File | Blob | { uri: string; type: string; name: string };
  let detectedContentType = 'image/jpeg'; // Default
  let finalExtension = 'jpg'; // Default
  
  if (typeof window !== 'undefined') {
    // Web: Convert image URI to File/Blob
    try {
      let blob: Blob;
      let fileExtension = 'jpg'; // Default
      
      // Handle blob URLs (from expo-image-picker on web)
      if (imageUri.startsWith('blob:')) {
        const response = await fetch(imageUri);
        blob = await response.blob();
        detectedContentType = blob.type || 'image/jpeg';
        // Determine extension from MIME type
        if (detectedContentType.includes('png')) fileExtension = 'png';
        else if (detectedContentType.includes('jpeg') || detectedContentType.includes('jpg')) fileExtension = 'jpg';
        else if (detectedContentType.includes('webp')) fileExtension = 'webp';
        else if (detectedContentType.includes('gif')) fileExtension = 'gif';
      } 
      // Handle data URLs
      else if (imageUri.startsWith('data:')) {
        const response = await fetch(imageUri);
        blob = await response.blob();
        detectedContentType = blob.type || imageUri.split(';')[0].split(':')[1] || 'image/jpeg';
        if (detectedContentType.includes('png')) fileExtension = 'png';
        else if (detectedContentType.includes('jpeg') || detectedContentType.includes('jpg')) fileExtension = 'jpg';
        else if (detectedContentType.includes('webp')) fileExtension = 'webp';
        else if (detectedContentType.includes('gif')) fileExtension = 'gif';
      } 
      // Handle regular HTTP URLs
      else if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
        const response = await fetch(imageUri);
        blob = await response.blob();
        detectedContentType = blob.type || 'image/jpeg';
        // Try to get extension from URL
        const urlMatch = imageUri.match(/\.(png|jpg|jpeg|webp|gif)/i);
        if (urlMatch) fileExtension = urlMatch[1].toLowerCase();
        else if (detectedContentType.includes('png')) fileExtension = 'png';
        else if (detectedContentType.includes('jpeg') || detectedContentType.includes('jpg')) fileExtension = 'jpg';
        else if (detectedContentType.includes('webp')) fileExtension = 'webp';
        else if (detectedContentType.includes('gif')) fileExtension = 'gif';
      } 
      // For web, if it's not a URL, throw error
      else {
        throw new Error('Invalid image URI format for web: ' + imageUri.substring(0, 50));
      }
      
      // Update extension
      finalExtension = fileExtension;
      fileToUpload = new File([blob], `${filenameBase}.${fileExtension}`, { type: detectedContentType });
    } catch (error) {
      console.error('Error converting image for web upload:', error);
      throw new Error(`Failed to prepare image for upload: ${error}`);
    }
  } else {
    // Native: Use React Native FormData format
    // Try to detect type from URI extension
    let fileExtension = 'jpg';
    if (imageUri.toLowerCase().includes('.png')) {
      detectedContentType = 'image/png';
      fileExtension = 'png';
    } else if (imageUri.toLowerCase().includes('.jpg') || imageUri.toLowerCase().includes('.jpeg')) {
      detectedContentType = 'image/jpeg';
      fileExtension = 'jpg';
    } else if (imageUri.toLowerCase().includes('.webp')) {
      detectedContentType = 'image/webp';
      fileExtension = 'webp';
    }
    
    // Update extension
    finalExtension = fileExtension;
    fileToUpload = {
      uri: imageUri,
      type: detectedContentType,
      name: `${filenameBase}.${fileExtension}`,
    } as any;
  }

  const formData = new FormData();
  // @ts-ignore - FormData accepts different formats for web/native
  formData.append('file', fileToUpload);

  // Final filename with correct extension
  const finalFilename = `${filenameBase}.${finalExtension}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(`${userId}/${finalFilename}`, formData as any, {
      contentType: detectedContentType,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}
