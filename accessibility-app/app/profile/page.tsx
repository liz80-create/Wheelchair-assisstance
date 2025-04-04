// PASTE THIS INTO: app/profile/page.tsx

"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Ensure Link is imported
import { useAuth } from '@/components/auth-provider'; // Adjust path if needed
import apiClient from '@/lib/apiClient'; // Adjust path if needed
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, User, Shield, ListChecks } from 'lucide-react'; // Added ListChecks
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Define a type for the expected profile data from your API
interface UserProfileData {
  id: number;
  user_type: 'seeker' | 'provider' | 'admin';
  accessibility_needs: {
    id: number;
    name: string;
    description?: string | null;
  }[];
}

// Define a combined type for User + Profile for convenience
interface UserWithProfile extends UserProfileData {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
}

// --- The React Component Function ---
export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to fetch profile data
    const fetchProfile = async () => {
        if (!user) return; // Should not happen if initial check passes, but safety first

        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<UserProfileData>('/profile/');
            setProfileData({
                ...response,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
            });
        } catch (err: any) {
            console.error("Error fetching profile:", err);
            if (err.response && err.response.status === 401) {
                setError("Authentication failed. Please log in again.");
                router.replace('/login?message=Session expired. Please log in again.');
            } else {
                setError(err.message || "Failed to load profile data.");
            }
            setProfileData(null);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
      return; // Wait until authentication status is known
    }

    if (!user) {
      router.replace('/login?message=Please log in to view your profile.');
      return; // Stop execution if not logged in
    }

    // User is logged in and auth check is complete, fetch profile
    fetchProfile();

  }, [user, authLoading, router]); // Dependencies for the effect


  // --- Conditional Rendering ---

  // 1. Loading State (Auth check or profile fetch)
  if (authLoading || (user && loading)) { // Show loading if auth check ongoing OR if logged in but profile is fetching
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="container py-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error Loading Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
      </div>
    );
  }

  // 3. Not Logged In / No Profile Data (Should be caught by loading/redirect/error, but as final fallback)
  if (!user || !profileData) {
    return (
      <div className="container py-8 text-center">
        <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Profile information is currently unavailable.</p>
         <Link href="/login">
            <Button>Go to Login</Button>
         </Link>
      </div>
    );
  }

  // 4. Success State: Render Profile Content
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{profileData.first_name} {profileData.last_name}</span>
             {/* Consider adding a general Edit Profile button here later */}
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">@{profileData.username} • {profileData.email}</p>
          <div className="flex items-center pt-2">
                <Shield className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400 capitalize">{profileData.user_type} Account</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display Accessibility Needs only for 'seeker' type */}
          {profileData.user_type === 'seeker' && (
            <div>
              {/* Section Header with Edit Button */}
              <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold flex items-center">
                    <ListChecks className="h-5 w-5 mr-2 text-green-600"/>
                    Your Accessibility Needs
                  </h3>
                  {/* Link to the Edit Page */}
                  <Link href="/profile/edit">
                      <Button variant="outline" size="sm">Edit Needs</Button>
                  </Link>
              </div>
              {/* Display Needs or Placeholder */}
              {profileData.accessibility_needs && profileData.accessibility_needs.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profileData.accessibility_needs.map((need) => (
                    <Badge key={need.id} variant="secondary" className="text-sm py-1 px-3">
                      {need.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  You haven't specified any accessibility needs yet.{" "}
                  <Link href="/profile/edit" className="text-green-600 hover:underline font-medium">
                    Set them now?
                  </Link>
                </p>
              )}
            </div>
          )}

          {/* Example: Section for Providers */}
          {profileData.user_type === 'provider' && (
             <div>
                 <h3 className="text-lg font-semibold mb-3 flex items-center">
                   {/* Icon placeholder */}
                    Your Listed Places
                 </h3>
                 {/* TODO: Fetch and display places owned by this provider */}
                 <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    Your places will be listed here. (Functionality to be added)
                 </p>
             </div>
          )}

          {/* Add other profile sections as needed */}

        </CardContent>
      </Card>
    </div>
  );
}