import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { APIResponse } from '../types/class.types';

// Get API URL from environment or use default
// This approach works in both Vite and Jest environments
const getApiBaseUrl = (): string => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && 'ENV_API_URL' in window) {
    return (window as any).ENV_API_URL;
  }
  
  // Default API URL for development and testing
  return 'http://localhost:4000/api';
};

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An unexpected error occurred';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

// Generic API methods
export async function get<T>(url: string): Promise<APIResponse<T>> {
  console.log(`[DEBUG] API: GET request to ${url}`);
  try {
    const response: AxiosResponse<APIResponse<T>> = await axiosInstance.get(url);
    console.log(`[DEBUG] API: Raw response from ${url}:`, response);
    console.log(`[DEBUG] API: Response data from ${url}:`, response.data);
    
    if (!response.data) {
      console.error(`[DEBUG] API: No data in response from ${url}`);
      return { data: {} as T, success: false };
    }
    
    if (!response.data.data) {
      console.error(`[DEBUG] API: Invalid response format from ${url}:`, response.data);
      return { data: {} as T, success: false };
    }
    
    return response.data;
  } catch (error: any) {
    console.error(`[DEBUG] API: Error in GET request to ${url}:`, error);
    
    const errorDetails = {
      message: error?.message || 'Unknown error',
      response: error?.response?.data || null,
      status: error?.response?.status || 500
    };
    
    console.error(`[DEBUG] API: Error details:`, errorDetails);
    return { data: {} as T, success: false };
  }
}

export async function post<T>(url: string, data: unknown): Promise<APIResponse<T>> {
  const response: AxiosResponse<APIResponse<T>> = await axiosInstance.post(url, data);
  return response.data;
}

export async function put<T>(url: string, data: unknown): Promise<APIResponse<T>> {
  const response: AxiosResponse<APIResponse<T>> = await axiosInstance.put(url, data);
  return response.data;
}

export async function del<T>(url: string): Promise<APIResponse<T>> {
  const response: AxiosResponse<APIResponse<T>> = await axiosInstance.delete(url);
  return response.data;
}

// Form data post method for file uploads
export async function postFormData<T>(url: string, formData: FormData): Promise<APIResponse<T>> {
  const response: AxiosResponse<APIResponse<T>> = await axiosInstance.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

// Export the axios instance for direct use if needed
export { axiosInstance };