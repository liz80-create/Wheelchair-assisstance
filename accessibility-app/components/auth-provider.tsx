"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import apiClient from "@/lib/apiClient" // Import the API client helper
import type { User, UserProfile } from "@/types/api" // Import your defined API types

// Type for the JWT token response
type TokenResponse = {
  access: string;
  refresh: string;
}

// Type for the combined User details fetched after login
type CombinedUser = User & { user_type?: UserProfile['user_type'] };

type AuthContextType = {
  user: CombinedUser | null
  // token state is removed, handled implicitly by apiClient & localStorage
  login: (username: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void> // Keep 'any' for simplicity or define a specific RegisterFormData type
  logout: () => void
  isLoading: boolean // Tracks initial auth check and ongoing login/register processes
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// --- Token Storage Helpers ---
const storeTokens = (access: string, refresh: string) => {
  if (typeof window !== 'undefined') {
    try {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
    } catch (e) {
        console.error("Failed to store tokens in localStorage:", e);
        // Handle potential storage errors (e.g., private browsing mode)
    }
  }
};

const clearTokens = () => {
  if (typeof window !== 'undefined') {
    try {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user'); // Also clear cached user data if stored
    } catch (e) {
        console.error("Failed to clear tokens from localStorage:", e);
    }
  }
};

const getAccessToken = (): string | null => {
    if (typeof window !== 'undefined') {
        try {
            return localStorage.getItem('access_token');
        } catch (e) {
             console.error("Failed to get access token from localStorage:", e);
             return null;
        }
    }
    return null;
}
// --- End Token Storage Helpers ---


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CombinedUser | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start true for initial check
  const router = useRouter()
  const { toast } = useToast()

  // --- Function to fetch user details using token ---
   const fetchUserDetails = async (): Promise<CombinedUser | null> => {
     const token = getAccessToken();
     if (!token) {
       return null;
     }
     try {
       // Fetch both user details and profile details concurrently
       // Requires /auth/me/ and /profile/ endpoints on the backend
       const [userData, profileData] = await Promise.all([
         apiClient.get<User>('/auth/me/'),
         apiClient.get<UserProfile>('/profile/') // Assumes profileData has id, user_type, accessibility_needs
       ]);

       // Combine data: core user details + user_type from profile
       const combinedUser: CombinedUser = {
           ...userData,
           user_type: profileData.user_type, // Add user_type from profile response
           // Optionally add full profile nested if needed elsewhere
           // profile: profileData
        };
        // Optionally cache user data in localStorage (be mindful of staleness)
        // localStorage.setItem('user', JSON.stringify(combinedUser));
       return combinedUser;

     } catch (error: any) {
       console.error("Failed to fetch user details:", error);
       if (error.response && error.response.status === 401) {
            console.log("Token likely expired or invalid, clearing tokens.");
            clearTokens(); // Clear invalid tokens if fetch fails due to auth
       } else {
            // Handle other fetch errors (network, server down, etc.)
            // Maybe show a toast?
            toast({
                title: "Connection Error",
                description: "Could not fetch user details. Please check your connection.",
                variant: "destructive",
            });
       }
       return null; // Return null if fetching fails
     }
   };

  // --- Effect for Initial Authentication Check ---
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      const fetchedUser = await fetchUserDetails();
      setUser(fetchedUser);
      setIsLoading(false);
    };

    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on initial mount

  // --- Login Function ---
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // POST to the simplejwt token endpoint defined in urls.py
      const response = await apiClient.post<TokenResponse>('/auth/login/', {
        username,
        password,
      });

      storeTokens(response.access, response.refresh); // Store received tokens

      // Fetch user details immediately after successful login
      const fetchedUser = await fetchUserDetails();
      if (fetchedUser) {
          setUser(fetchedUser); // Update user state
          toast({
            title: "Login successful",
            description: `Welcome back, ${fetchedUser.first_name || fetchedUser.username}!`,
          });
          router.push("/dashboard"); // Redirect to dashboard
      } else {
          // This case should be rare if login succeeded but fetch failed immediately after
          throw new Error("Login succeeded but failed to fetch user details.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      clearTokens(); // Clear any potentially stored invalid tokens
      setUser(null); // Ensure user state is null on login failure

      let errorMessage = "Login failed. Please check credentials.";
       if (error.response && error.response.data) {
           const errorData = error.response.data;
           if (errorData.detail) errorMessage = errorData.detail;
           // Add handling for other DRF error structures if necessary
       } else if (error.message && !error.message.includes('Network Error')) { // Avoid generic network error message
            errorMessage = error.message;
       }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      // Don't re-throw here, toast is shown. Let the component rely on isLoading/user state.
    } finally {
      setIsLoading(false);
    }
  }

  // --- Register Function ---
  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      // POST to the custom registration endpoint defined in urls.py
      // The payload structure must match your RegisterSerializer fields
      await apiClient.post<User>('/auth/register/', {
        username: userData.username,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        password: userData.password,
        password2: userData.password2, // Required by your serializer validation
        user_type: userData.user_type,   // Required by your serializer
      });

      toast({
        title: "Registration successful",
        description: "You can now log in with your new credentials.",
      });

      // Don't auto-login here, redirect to login page for explicit login
      router.push("/login");

    } catch (error: any) {
      console.error("Registration error:", error);

       // Format API validation errors for the toast
       let errorMessage = "Registration failed. Please check your input and try again.";
        if (error.response && error.response.data) {
            const errors = error.response.data;
             const messages = Object.entries(errors)
               .map(([field, fieldMessages]) => `${field}: ${Array.isArray(fieldMessages) ? fieldMessages.join(', ') : fieldMessages}`)
               .join(' | '); // Join with pipe for readability in toast
            if (messages) errorMessage = messages;
            else if (errors.detail) errorMessage = errors.detail;
        } else if (error.message) {
            errorMessage = error.message;
        }

      toast({
        title: "Registration failed",
        description: errorMessage.replace('|', '\n'), // Replace pipe with newline for toast
        variant: "destructive",
      });
      // Don't re-throw, toast is shown
    } finally {
      setIsLoading(false);
    }
  }

  // --- Logout Function ---
  const logout = () => {
    clearTokens(); // Clear tokens from storage
    setUser(null); // Clear user state
    router.push("/"); // Redirect to home page
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  }

  // Provide the context value
  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

// --- Custom Hook ---
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}