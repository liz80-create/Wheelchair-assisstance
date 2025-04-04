// lib/apiClient.ts

// Base URL for your Django API - Reads from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.warn(
    "Warning: NEXT_PUBLIC_API_URL environment variable is not set. API calls might fail."
  );
  // You could throw an error here if the API URL is absolutely required at build time,
  // but usually, it's better to let it fail at runtime if needed.
}

/**
 * Interface for custom options passed to the apiClient.
 * Extends standard RequestInit properties.
 */
interface RequestOptions extends RequestInit {
  /** Optional data payload for POST/PUT/PATCH requests. Will be JSON.stringified. */
  data?: any;
  /** Set to true if the response is expected to have no body (e.g., 204 No Content). */
  noContentResponse?: boolean;
}

/**
 * Fetches data from the API with consistent configuration.
 * Handles base URL, JSON content type, JWT authentication, and basic error handling.
 *
 * @template T The expected type of the successful response data.
 * @param {string} endpoint The API endpoint path (e.g., '/places/', '/auth/login/').
 * @param {RequestOptions} [options={}] Optional fetch configuration (method, headers, body, etc.).
 * @returns {Promise<T>} A promise that resolves with the fetched data or rejects with an error.
 */
async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET', // Default to GET
    data,
    headers: customHeaders,
    noContentResponse = false, // Default to expecting content
    ...customOptions // Other standard fetch options (signal, cache, etc.)
  } = options;

  const headers: HeadersInit = {
    // Assume JSON content type by default. Can be overridden by customHeaders.
    'Content-Type': 'application/json',
    Accept: 'application/json', // Explicitly accept JSON responses
    ...customHeaders, // Allow overriding default headers
  };

  // --- Add JWT Authentication Header ---
  // This block runs only in the browser environment where localStorage is available.
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Assert that headers can be indexed like this
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      // Or assert just the key access
      // headers['Authorization' as keyof HeadersInit] = `Bearer ${token}`; // Less common
    }
  }
  // --- End Authentication ---

  const config: RequestInit = {
    method: method.toUpperCase(), // Ensure method is uppercase
    headers,
    ...customOptions, // Include other fetch options like 'signal' for aborting
  };

  // Add body for relevant methods, stringifying the 'data' option
  if (data && (config.method === 'POST' || config.method === 'PUT' || config.method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  const requestUrl = `${API_URL}${endpoint}`; // Construct the full URL

  try {
    const response = await fetch(requestUrl, config);

    // --- Handle No Content Response ---
    // Check before response.ok because 204 is considered ok but has no body to parse
    if (response.status === 204 || noContentResponse) {
      return undefined as T; // Return undefined for successful no-content responses
    }

    // --- Check for HTTP errors ---
    if (!response.ok) {
      let errorData: any = { detail: `HTTP error! Status: ${response.status} ${response.statusText}` };
      try {
        // Attempt to parse error details from the response body (DRF often provides JSON errors)
        errorData = await response.json();
      } catch (e) {
        // If parsing the error body fails, stick with the basic status text error
        console.warn(`Could not parse error response body for ${requestUrl}`, e);
      }

      console.error("API Error Response:", { status: response.status, url: requestUrl, data: errorData });

      // Throw an error object that includes status and parsed data if available
      const error = new Error(errorData?.detail || `Request failed with status ${response.status}`) as any;
      error.status = response.status;
      error.response = errorData; // Attach the parsed error response
      throw error;
    }

    // --- Parse Successful JSON Response ---
    // Assume successful responses are JSON unless noContentResponse was true (handled above)
    try {
       return await response.json() as T;
    } catch(e) {
        console.error(`Could not parse successful JSON response for ${requestUrl}`, e);
        throw new Error("Failed to parse server response.");
    }

  } catch (error: any) {
    // Handle network errors or errors thrown during response processing
    console.error(`API Client Fetch Error for ${requestUrl}:`, error);

    // Re-throw the error so it can be caught by the calling code
    // If it's not already an error object with details, wrap it.
    if (error.status && error.response) {
        throw error; // Already has status and response data
    } else {
        const networkError = new Error(error.message || "Network error or client-side issue.") as any;
        networkError.isNetworkError = true; // Add a flag for network errors
        throw networkError;
    }
  }
}

// --- Convenience Methods (Optional but Recommended) ---

/** Makes a GET request. */
apiClient.get = <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'data'>) =>
  apiClient<T>(endpoint, { ...options, method: 'GET' });

/** Makes a POST request with JSON data. */
apiClient.post = <T>(endpoint: string, data: any, options?: Omit<RequestOptions, 'method' | 'data'>) =>
  apiClient<T>(endpoint, { ...options, method: 'POST', data });

/** Makes a PUT request with JSON data. */
apiClient.put = <T>(endpoint: string, data: any, options?: Omit<RequestOptions, 'method' | 'data'>) =>
  apiClient<T>(endpoint, { ...options, method: 'PUT', data });

/** Makes a PATCH request with JSON data. */
apiClient.patch = <T>(endpoint: string, data: any, options?: Omit<RequestOptions, 'method' | 'data'>) =>
  apiClient<T>(endpoint, { ...options, method: 'PATCH', data });

/** Makes a DELETE request. */
apiClient.delete = <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'data'>) =>
  apiClient<T>(endpoint, { ...options, method: 'DELETE', noContentResponse: true }); // DELETE often returns 204

export default apiClient;