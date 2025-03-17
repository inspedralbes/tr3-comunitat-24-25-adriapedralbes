/**
 * Utility functions for formatting data in the application
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.futurprive.com';

/**
 * Format an avatar URL to ensure it has the correct base URL
 * @param url The avatar URL to format
 * @returns The formatted URL
 */
export const formatAvatarUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // If it already starts with http, it's a complete URL
  if (url.startsWith('http')) return url;
  
  // Ensure url starts with a slash
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  
  // Make sure API_BASE_URL doesn't end with a slash
  const baseUrl = API_BASE_URL.endsWith('/') 
    ? API_BASE_URL.slice(0, -1) 
    : API_BASE_URL;
  
  // Combine base URL with the path
  return `${baseUrl}${cleanUrl}`;
};

/**
 * Format an image URL to ensure it has the correct base URL
 * @param url The image URL to format
 * @returns The formatted URL
 */
export const formatImageUrl = (url: string | null | undefined): string | null => {
  return formatAvatarUrl(url);
};
