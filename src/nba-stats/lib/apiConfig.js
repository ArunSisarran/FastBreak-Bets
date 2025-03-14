
// port where the local Python server will run
const LOCAL_PORT = process.env.NEXT_PUBLIC_LOCAL_BACKEND_PORT || '5000';

// Function to get the API base URL 
const getApiBaseUrl = () => {
  
  if (typeof window !== 'undefined') {
    return `http://localhost:${LOCAL_PORT}`;
  }
  
  return `/api-local-placeholder`;
};

export const apiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  console.log('API Base URL:', baseUrl); 
  console.log('Full API URL:', `${baseUrl}${endpoint}`); 
  return `${baseUrl}${endpoint}`;
};

export const checkLocalBackendStatus = async () => {
  try {
    // Simple fetch
    const response = await fetch('http://localhost:5000/api/ping', {
      mode: 'cors',  
      cache: 'no-cache'  
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
