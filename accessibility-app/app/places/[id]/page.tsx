"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MapPin, Phone, Globe, Star, Clock, Check, X, ThumbsUp, ThumbsDown, User, Calendar, ChevronLeft, AlertCircle, Info
} from "lucide-react"
import ReviewForm from "@/components/review-form"
import apiClient from "@/lib/apiClient"
import type { Place, Review, AccessibilityFeature } from "@/types/api" // Ensure these types match your API structure

// Define the interface for DRF Paginated Response
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Helper function to format verification status
const formatVerificationStatus = (status: string) => {
    switch (status) {
        case 'verified': return 'Verified Accurate';
        case 'inaccurate': return 'Reported Inaccurate';
        case 'partial': return 'Partially Accurate';
        case 'unverified': return 'Not Yet Verified';
        default: return 'Unknown';
    }
}

export default function PlaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const placeId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : null;

  useEffect(() => {
    if (!placeId) {
        setError("Place ID is missing.");
        setLoading(false);
        // Optionally redirect: router.push('/places');
        return; // Don't fetch if ID isn't available
    }

    const fetchPlaceData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch place and its reviews from the API
        // Note the type change for the reviews fetch
        const [placeData, reviewsResponse] = await Promise.all([
          apiClient.get<Place>(`/places/${placeId}/`),
          apiClient.get<PaginatedResponse<Review>>(`/reviews/?place_id=${placeId}`) // Expect PaginatedResponse
        ]);
        setPlace(placeData);
        // Extract the 'results' array from the paginated response
        setReviews(reviewsResponse.results); // <-- Use .results here
      } catch (err: any) {
        console.error("Error fetching place data:", err);
         if (err.response && err.response.status === 404) {
            setError(`Place with ID ${placeId} not found.`);
            // Optionally redirect: router.push('/places');
         } else {
            setError(err.message || "Failed to load place details. Please try again.");
         }
        setPlace(null); // Ensure place is null on error
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaceData();
  }, [placeId, router]); // Re-fetch if the ID changes

  // Callback for when a new review is successfully submitted
   const handleReviewSubmit = (newReviewFromApi: Review) => {
     // Assuming the API returns the single created review directly (not paginated)
     setReviews(prevReviews => [newReviewFromApi, ...prevReviews]); // Add to list
     setShowReviewForm(false); // Hide form
     // Update review count locally for immediate feedback
     // Ensure place exists and review_count is a number before incrementing
     setPlace(prevPlace => {
       if (!prevPlace) return null;
       const currentCount = typeof prevPlace.review_count === 'number' ? prevPlace.review_count : 0;
       return { ...prevPlace, review_count: currentCount + 1 };
     });
   };

  // --- RENDER LOADING ---
  if (loading || authLoading) {
    return (
      <div className="container py-8">
        {/* Keep existing Skeleton structure */}
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-6 w-72 mb-6" />

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Skeleton className="h-[300px] w-full mb-6" />
            <Skeleton className="h-8 w-40 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-6" />

            <Skeleton className="h-8 w-40 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
             <Skeleton className="h-8 w-40 mb-4" />
             <Skeleton className="h-32 w-full mb-4" />
             <Skeleton className="h-32 w-full mb-4" />
          </div>

          <div className="md:col-span-1">
            <Skeleton className="h-[250px] w-full mb-6" /> {/* Contact card */}
            <Skeleton className="h-[300px] w-full mb-6" /> {/* Map card */}
            <Skeleton className="h-10 w-full mb-3" />
            <Skeleton className="h-10 w-full mb-3" />
            <Skeleton className="h-10 w-full mb-3" />
          </div>
        </div>
      </div>
    )
  }

  // --- RENDER ERROR or NOT FOUND ---
   if (error || !place) {
     return (
       <div className="container py-8 text-center">
         <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
         <h1 className="text-2xl font-bold mb-4 text-red-600">{ error ? "Error Loading Place" : "Place Not Found"}</h1>
         <p className="text-gray-600 dark:text-gray-400 mb-6">{error ?? `The place with ID ${placeId} could not be found.`}</p>
         <Link href="/places">
           <Button>
             <ChevronLeft className="h-4 w-4 mr-2" />
             Back to Places
           </Button>
         </Link>
       </div>
     );
   }

  // --- RENDER CONTENT ---
  // Use fetched 'place' and 'reviews' data
  // Ensure place is not null before accessing its properties (already handled by error check above)
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/places" className="text-green-600 hover:text-green-700 flex items-center mb-2 text-sm">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Places
        </Link>
        <h1 className="text-3xl font-bold mb-2">{place.name}</h1>
        <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2 text-sm">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{place.address}</span>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge className="capitalize bg-green-600">{place.place_type.replace('_', ' ')}</Badge>
          <div className="flex items-center text-sm">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
             {/* Use fetched review count, handle potential undefined/null */}
             <span>
                {(typeof place.review_count === 'number' ? place.review_count : 0)}{' '}
                {(typeof place.review_count === 'number' && place.review_count === 1) ? 'review' : 'reviews'}
             </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          {/* Place Image - Kept placeholder */}
          <div className="h-[300px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-6">
            <img
              // Consider using a real image source if available, otherwise placeholder
              src={`https://via.placeholder.com/800x300.png?text=${encodeURIComponent(place.name)}`}
              alt={place.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Place Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">About {place.name}</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap"> {/* Handle newlines */}
                {place.description || <span className="italic text-gray-500">No description provided.</span>}
            </p>
          </div>

          {/* Accessibility Features */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Accessibility Features</h2>
            {place.accessibility_features && place.accessibility_features.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Use fetched features */}
                {place.accessibility_features.map((feature) => (
                    <Card key={feature.id} className="border-l-4 border-green-500 dark:border-green-600">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mt-1">
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-medium">{feature.name}</h3>
                             {/* Handle null/empty description */}
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {feature.description || <span className="italic">No details available.</span>}
                            </p>
                        </div>
                        </div>
                    </CardContent>
                    </Card>
                ))}
                </div>
             ) : (
                <Card className="border-l-4 border-gray-300 dark:border-gray-600">
                     <CardContent className="p-4 flex items-center gap-3 text-gray-500 dark:text-gray-400">
                         <Info className="h-5 w-5 flex-shrink-0"/>
                         <span>No specific accessibility features listed for this place yet.</span>
                     </CardContent>
                </Card>
             )}
          </div>

          {/* Reviews Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              {/* Display the count from the state variable */}
              <h2 className="text-xl font-semibold">Reviews ({reviews.length})</h2>
              {/* Show button only if logged in and form not already shown */}
              {user && !showReviewForm && (
                <Button onClick={() => setShowReviewForm(true)} className="bg-green-600 hover:bg-green-700">
                  Write a Review
                </Button>
              )}
              {!user && !authLoading && (
                 <Link href={`/login?redirect=/places/${placeId}`}>
                    <Button variant="outline">Log in to Review</Button>
                 </Link>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && user && place && ( // Ensure place is not null here
              <div className="mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="text-lg font-medium">Share Your Experience</h3>
                         <Button variant="ghost" size="sm" onClick={() => setShowReviewForm(false)}>
                             <X className="h-4 w-4"/>
                             <span className="sr-only">Close review form</span>
                         </Button>
                    </div>
                     {/* Ensure ReviewForm component exists and accepts these props */}
                    <ReviewForm
                      placeId={place.id}
                      // Pass only the features listed for the place, ensure it's an array
                      accessibilityFeatures={place.accessibility_features ?? []}
                      onSubmit={handleReviewSubmit} // Pass callback
                      onCancel={() => setShowReviewForm(false)}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

             {/* Existing Reviews List */}
            {reviews.length === 0 && !showReviewForm ? ( // Don't show "No reviews yet" if form is open
              <div className="text-center py-8 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Be the first to share your experience!</p>
                {user && ( // Show button only if logged in
                  <Button onClick={() => setShowReviewForm(true)} className="bg-green-600 hover:bg-green-700">
                    Write First Review
                  </Button>
                )}
                 {!user && !authLoading && (
                     <Link href={`/login?redirect=/places/${placeId}`}>
                        <Button>Log in to write a review</Button>
                     </Link>
                 )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Use fetched reviews state variable */}
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
                        {/* User Info */}
                        <div className="flex items-center flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div>
                            {/* Use fetched user details, ensure user object exists */}
                            <div className="font-medium">{review.user?.first_name || review.user?.username || 'Anonymous'}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(review.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {/* Ratings */}
                        <div className="flex flex-col sm:items-end gap-1 w-full sm:w-auto">
                            <div className="flex items-center">
                                <span className="text-xs font-medium mr-2 w-20 text-right">Overall:</span>
                                <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                    key={`rating-${review.id}-${i}`} // More specific key
                                    className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300 dark:text-gray-600"}`}
                                    />
                                ))}
                                </div>
                            </div>
                            {/* Handle accessibility_rating being potentially null */}
                            {typeof review.accessibility_rating === 'number' && (
                                <div className="flex items-center">
                                <span className="text-xs font-medium mr-2 w-20 text-right">Accessibility:</span>
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={`acc-rating-${review.id}-${i}`} // More specific key
                                        className={`h-4 w-4 ${i < review.accessibility_rating! ? "text-green-500 fill-green-500" : "text-gray-300 dark:text-gray-600"}`}
                                    />
                                    ))}
                                </div>
                                </div>
                            )}
                        </div>
                      </div>

                      {/* Comment */}
                       <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                           {review.comment || <span className="italic text-gray-500">No comment provided.</span>}
                        </p>

                      {/* Verification Details - Check if arrays exist and have length */}
                      {(review.verified_features?.length > 0 || review.missing_features?.length > 0) && (
                        <div className="mt-4 pt-4 border-t dark:border-gray-700">
                           <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                Accessibility Verification
                                <Badge variant={review.accessibility_verification === 'verified' ? 'default' : review.accessibility_verification === 'inaccurate' ? 'destructive' : 'secondary'}
                                       className="text-xs">
                                    {formatVerificationStatus(review.accessibility_verification)}
                                </Badge>
                           </h4>

                          {review.verified_features?.length > 0 && (
                            <div className="mb-3">
                              <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1 flex items-center">
                                <Check className="h-3 w-3 mr-1" />
                                Verified as Present / Adequate
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {review.verified_features.map((feature) => (
                                  <Badge
                                    key={`vf-${review.id}-${feature.id}`} // More specific key
                                    variant="outline"
                                    className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700"
                                  >
                                    {feature.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {review.missing_features?.length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1 flex items-center">
                                <X className="h-3 w-3 mr-1" />
                                Reported as Missing / Inadequate
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {review.missing_features.map((feature) => (
                                  <Badge
                                    key={`mf-${review.id}-${feature.id}`} // More specific key
                                    variant="outline"
                                    className="text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700"
                                  >
                                    {feature.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                       {/* Helpful buttons - Kept as is, functionality not implemented */}
                      <div className="mt-4 flex items-center justify-end gap-2 border-t dark:border-gray-700 pt-4">
                        <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 text-xs">
                          <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                          Helpful
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 text-xs">
                          <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                          Not Helpful
                        </Button>
                         {/* Add Edit/Delete for review owner later */}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="md:col-span-1">
          {/* Contact & Info Card */}
          <Card className="mb-6 sticky top-24"> {/* Added sticky */}
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Contact & Information</h3>
              <div className="space-y-3 text-sm">
                {/* Use fetched place details */}
                {place.phone_number && (
                    <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                    <a href={`tel:${place.phone_number}`} className="text-green-600 hover:text-green-700 break-all">
                        {place.phone_number}
                    </a>
                    </div>
                )}

                {place.website && (
                    <div className="flex items-center">
                    <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                    <a
                        href={place.website.startsWith('http') ? place.website : `https://${place.website}`} // Ensure protocol
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 break-all"
                    >
                        Visit Website
                    </a>
                    </div>
                )}

                <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">Added on {new Date(place.created_at).toLocaleDateString()}</span>
                </div>

                 {/* Show owner if available */}
                {place.owner && (
                    <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">
                        Listed by {place.owner.first_name || place.owner.username || 'Owner'}
                        </span>
                    </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Map Card - Kept placeholder, implement with library like Leaflet/Mapbox */}
          {place.latitude && place.longitude && ( // Only show if coords exist
            <Card className="mb-6">
                <CardContent className="p-0">
                <div className="h-[300px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded-lg">
                    <div className="text-center p-4">
                    <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">Map view would display here</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        ({place.latitude}, {place.longitude})
                    </p>
                     {/* Add link to Google Maps */}
                     <a
                       href={`https://www.google.com/maps/search/?api=1&query=${place.latitude}%2C${place.longitude}`}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-sm text-green-600 hover:text-green-700 mt-2 inline-block"
                     >
                       View on Google Maps →
                     </a>
                    </div>
                </div>
                </CardContent>
            </Card>
          )}

          {/* Action Buttons - Kept as is, functionality not implemented */}
          <div className="space-y-3">
            {place.latitude && place.longitude && (
                 <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude}%2C${place.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                 >
                    <Button className="w-full bg-green-600 hover:bg-green-700">Get Directions</Button>
                 </a>
            )}
            <Button variant="outline" className="w-full" onClick={() => alert('Share functionality to be implemented.')}>
              Share This Place
            </Button>
            <Button variant="outline" className="w-full text-yellow-600 border-yellow-300 hover:bg-yellow-50 dark:text-yellow-400 dark:border-yellow-700 dark:hover:bg-yellow-900/50" onClick={() => alert('Report functionality to be implemented.')}>
              Report Inaccurate Information
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}