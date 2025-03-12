// lib/apiConfig.js

/**
 * API Configuration for Next.js Frontend
 * 
 * This configuration connects to a locally running backend server
 * that the user needs to run on their machine.
 */

// The port where the local Python server will run
const LOCAL_PORT = process.env.NEXT_PUBLIC_LOCAL_BACKEND_PORT || '5000';

// Function to get the API base URL (always using localhost)
const getApiBaseUrl = () => {
  // When running in the browser
  if (typeof window !== 'undefined') {
    return `http://localhost:${LOCAL_PORT}`;
  }
  
  // When running on server-side (during SSR/build)
  // Return a placeholder URL since the local backend won't be accessible
  // This will be replaced client-side after hydration
  return `/api-local-placeholder`;
};

/**
 * Returns the full URL for an API endpoint
 * @param {string} endpoint - The API endpoint path (e.g., "/api/teams")
 * @returns {string} The complete URL
 */
export const apiUrl = (endpoint) => {
  return `${getApiBaseUrl()}${endpoint}`;
};

/**
 * Checks if the local backend server is running
 * @returns {Promise<boolean>} True if the server is running
 */
export const checkLocalBackendStatus = async () => {
  try {
    // Simple fetch with no fancy options
    const response = await fetch('http://localhost:5000/api/ping', {
      mode: 'cors',  // Explicitly set CORS mode
      cache: 'no-cache'  // Avoid caching issues
    });
    
    if (response.ok) {
      console.log('Backend ping successful');
      return true;
    } else {
      console.log('Backend ping failed with status:', response.status);
      return false;
    }
  } catch (err) {
    console.warn('Local backend check failed:', err.message);
    return false;
  }
};
