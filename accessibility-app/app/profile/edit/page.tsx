// CREATE THIS FILE AT: app/profile/edit/page.tsx

"use client"

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import apiClient from '@/lib/apiClient';
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckSquare, ListChecks, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
// Optional: For showing success/error messages nicely
// import { toast } from 'react-hot-toast'; // npm install react-hot-toast

// Types
interface AccessibilityFeature {
  id: number;
  name: string;
  description?: string | null;
}

interface UserProfileData {
  id: number;
  user_type: 'seeker' | 'provider' | 'admin';
  accessibility_needs: AccessibilityFeature[];
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export default function EditProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [availableFeatures, setAvailableFeatures] = useState<AccessibilityFeature[]>([]);
  const [selectedNeedsIds, setSelectedNeedsIds] = useState<Set<number>>(new Set());
  const [initialNeedsLoaded, setInitialNeedsLoaded] = useState(false);
  const [featuresLoaded, setFeaturesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all available features
  const fetchAvailableFeatures = useCallback(async () => {
    try {
      const response = await apiClient.get<PaginatedResponse<AccessibilityFeature>>('/features/');
      setAvailableFeatures(response.results.sort((a, b) => a.name.localeCompare(b.name)));
      setFeaturesLoaded(true);
    } catch (err) {
      console.error("Error fetching features:", err);
      setError("Could not load accessibility features options.");
      setFeaturesLoaded(true); // Still mark as loaded
    }
  }, []);

  // Fetch current user profile to get existing needs
  const fetchCurrentProfile = useCallback(async () => {
    try {
      const response = await apiClient.get<UserProfileData>('/profile/');
      // Only process if user is a seeker
      if (response.user_type === 'seeker') {
          const currentNeedIds = new Set(response.accessibility_needs.map(need => need.id));
          setSelectedNeedsIds(currentNeedIds);
      } else {
          // If user is not a seeker, maybe redirect or show a message?
          // For now, just ensure the Set is empty
          setSelectedNeedsIds(new Set());
      }
      setInitialNeedsLoaded(true);
    } catch (err) {
      console.error("Error fetching current profile:", err);
      setError("Could not load your current profile settings.");
      setInitialNeedsLoaded(true); // Still mark as loaded
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/login?message=Please log in to edit your profile.');
      return;
    }

    setLoading(true);
    setError(null);
    setInitialNeedsLoaded(false);
    setFeaturesLoaded(false);

    // Fetch both sets of data
    Promise.all([fetchCurrentProfile(), fetchAvailableFeatures()])
        .finally(() => {
            setLoading(false);
        });

  }, [user, authLoading, router, fetchCurrentProfile, fetchAvailableFeatures]);

  const handleCheckboxChange = (featureId: number, checked: boolean) => {
    setSelectedNeedsIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(featureId);
      } else {
        newSet.delete(featureId);
      }
      return newSet;
    });
  };

  const handleSaveChanges = async () => {
    // Only allow seekers to save needs
    if (user?.profile?.user_type !== 'seeker' && !authLoading) {
        setError("Only Accessibility Seekers can save needs.");
        return;
    }

    setIsSubmitting(true);
    setError(null);
    const needsIdsArray = Array.from(selectedNeedsIds);

    try {
      await apiClient.put('/profile/', { needs_ids: needsIdsArray });
      // toast.success('Profile updated successfully!'); // Optional toast
      router.push('/profile'); // Go back to profile display page
    } catch (err: any) {
      console.error("Error updating profile:", err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.needs_ids?.[0] || err.message || 'Failed to update profile.';
      // toast.error(errorMessage); // Optional toast
      setError(errorMessage);
      setIsSubmitting(false); // Keep button enabled on error
    }
  };

  // --- Render Logic ---

  if (loading || authLoading) {
    return (
       <div className="container py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64 mb-4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-2/3" />
          </CardContent>
           <CardFooter className="flex justify-end gap-2">
               <Skeleton className="h-10 w-24" />
               <Skeleton className="h-10 w-24" />
           </CardFooter>
        </Card>
      </div>
    );
  }

   if (!user) {
      return (
         <div className="container py-8 text-center">
             <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
             <p>Please log in to edit your profile.</p>
             <Link href="/login"><Button className="mt-4">Login</Button></Link>
         </div>
      )
   }

   // Show error if initial data failed to load
   if (error && (!initialNeedsLoaded || !featuresLoaded)) {
       return (
            <div className="container py-8 text-center">
               <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
               <h1 className="text-2xl font-bold mb-4 text-red-600">Error Loading Edit Page</h1>
               <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
               <Link href="/profile"><Button variant="outline">Back to Profile</Button></Link>
            </div>
       )
   }

   // Add check: Prevent non-seekers from seeing the needs editor
    if (user?.profile?.user_type !== 'seeker') {
        return (
             <div className="container py-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                <h1 className="text-2xl font-bold mb-4">Edit Needs Not Applicable</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Only Accessibility Seekers can edit accessibility needs.</p>
                <Link href="/profile"><Button variant="outline">Back to Profile</Button></Link>
             </div>
        );
    }


  return (
    <div className="container py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <ListChecks className="h-6 w-6 mr-2 text-green-600" />
            Edit Your Accessibility Needs
          </CardTitle>
          <CardDescription>
            Select the features that are important for you. This helps us recommend suitable places.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && ( // Show submission errors
             <div className="text-red-600 bg-red-50 dark:bg-red-900/30 p-3 rounded-md text-sm flex items-center gap-2">
                 <AlertCircle className="h-4 w-4 flex-shrink-0" />
                 <span>{error}</span>
             </div>
          )}

          {availableFeatures.length === 0 && featuresLoaded && !error && (
            <p className="text-gray-500 italic">No accessibility features available to select.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {availableFeatures.map((feature) => (
              <div key={feature.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`feature-${feature.id}`}
                  checked={selectedNeedsIds.has(feature.id)}
                  onCheckedChange={(checked) => handleCheckboxChange(feature.id, !!checked)}
                  disabled={isSubmitting}
                />
                <Label
                  htmlFor={`feature-${feature.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {feature.name}
                </Label>
              </div>
            ))}
          </div>

        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t pt-6">
          <Link href="/profile">
            <Button variant="outline" disabled={isSubmitting}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </Link>
          <Button
            onClick={handleSaveChanges}
            disabled={isSubmitting || !initialNeedsLoaded || !featuresLoaded}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}