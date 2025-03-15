import { api } from './api';
import { UserProfile } from './auth';

/**
 * Get a user profile by username
 * @param username The username to look up
 * @returns The user profile
 */
export const getUserByUsername = async (username: string): Promise<UserProfile> => {
  try {
    // Use the new endpoint to get user by username directly
    const userProfile = await api.get(`users/by_username/?username=${encodeURIComponent(username)}`);
    return userProfile;
  } catch (error) {
    console.error(`Error fetching user profile for '${username}':`, error);
    throw new Error(`User '${username}' not found`);
  }
};