/**
 * Utility functions for formatting data in the application
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

/**
 * Format an avatar URL to ensure it has the correct base URL
 * @param url The avatar URL to format
 * @returns The formatted URL
 */
export const formatAvatarUrl = (url: string | null): string | null => {
  if (!url) return null;
  
  // If it already starts with http, it's a complete URL
  if (url.startsWith('http')) return url;
  
  // Otherwise add the API base URL
  return `${API_BASE_URL}${url}`;
};

/**
 * Format an image URL to ensure it has the correct base URL
 * @param url The image URL to format
 * @returns The formatted URL
 */
export const formatImageUrl = (url: string | null): string | null => {
  return formatAvatarUrl(url);
};
