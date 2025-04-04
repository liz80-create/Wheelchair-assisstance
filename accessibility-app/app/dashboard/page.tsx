"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Star, Settings, LogOut, Building, Heart, Clock, Edit, Plus, ExternalLink, AlertCircle, Activity } from "lucide-react"
import apiClient from "@/lib/apiClient"
// Assuming you have these types defined in @/types/api
// Make sure this path is correct and the file exists with the type definitions
import type { Place, Review, User, AccessibilityFeature, UserSummary } from "@/types/api"

// --- Define Helper Types ---

// Type for the Paginated Response structure from DRF
type PaginatedResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[]; // The actual array of items
}

// Type for Reviews as used in the Dashboard state and Review Tab
// Explicitly makes 'place' an object, different from the base 'Review' type
type DashboardReview = Omit<Review, 'place'> & { // Omit the original number 'place' field
     place: { id: number; name: string }; // Add 'place' as an object
};

// --- Define Activity Types for the combined feed ---
type ReviewActivity = DashboardReview & { // Use DashboardReview which has place object
    type: 'review';
    date: Date;
}

type PlaceActivity = Place & { // Use Place type
    type: 'place';
    date: Date;
}

// Combined type for the activity feed
type ActivityItem = ReviewActivity | PlaceActivity;

// --- Dashboard Component ---

export default function DashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Dashboard data loading
  const [error, setError] = useState<string | null>(null);
  const [myPlaces, setMyPlaces] = useState<Place[]>([]); // Uses Place type
  const [myReviews, setMyReviews] = useState<DashboardReview[]>([]); // Uses DashboardReview type
  const [recommendations, setRecommendations] = useState<Place[]>([]); // Uses Place type
  const [combinedActivities, setCombinedActivities] = useState<ActivityItem[]>([]); // State for combined activities

  useEffect(() => {
    // Wait for auth check to complete
    if (authLoading) {
      setLoading(true); // Keep dashboard loading true while auth loads
      return;
    }
    // If auth is done and no user, redirect
    if (!user) {
      router.push("/login?redirect=/dashboard");
      return;
    }

    // Fetch data only if user is confirmed
    const fetchData = async () => {
       // Double check user exists before proceeding inside async func
      if (!user) {
          console.warn("fetchData called unexpectedly without user.");
          setLoading(false);
          return;
      }

      setLoading(true);
      setError(null);
      let fetchedUserPlaces: Place[] = [];
      let fetchedUserReviews: DashboardReview[] = [];

      try {
        // --- Setup API Requests ---
        // Expect paginated response for reviews
        const reviewRequest = apiClient.get<PaginatedResponse<Review>>('/reviews/');
        let otherRequest: Promise<any>; // Use 'any' for Promise.all

        // Setup request based on user type
        if (user.user_type === "seeker") {
          // Assume recommendations *might* be paginated, handle both cases
          otherRequest = apiClient.get<PaginatedResponse<Place> | Place[]>('/recommendations/');
        } else if (user.user_type === "provider") {
          // Assume places endpoint is also paginated
          otherRequest = apiClient.get<PaginatedResponse<Place>>('/places/');
        } else {
           otherRequest = Promise.resolve(null); // For admin or other types
        }

        // --- Fetch Data Concurrently ---
        const [reviewsResponse, otherDataResponse] = await Promise.all([reviewRequest, otherRequest]);

        // --- Process Reviews ---
        const allReviews = reviewsResponse.results;
        // Filter reviews client-side AND map to ensure place.name exists
        // NOTE: Backend filtering by user_id is much more efficient!
        fetchedUserReviews = allReviews
          .filter(review => review.user.id === user.id) // Filter first
          .map((r): DashboardReview => ({ // Assert the return type of map
            // Spread all properties from the original Review EXCEPT 'place'
            ...(({ place, ...rest }) => rest)(r),
            // Define the new 'place' object structure
            place: {
              id: r.place, // Use original place ID
              // Use place_name (read-only from serializer) or fallback
              name: r.place_name || `Place #${r.place}`
            }
          }));
        setMyReviews(fetchedUserReviews); // Set state with correctly typed array


        // --- Process Other Data ---
        if (user.user_type === "seeker" && otherDataResponse) {
          // FIX: Check if the recommendations response is paginated or a direct array
           let recommendationResults: Place[];
           if (Array.isArray(otherDataResponse)) {
               // It wasn't paginated, use the array directly
               recommendationResults = otherDataResponse;
           } else if (otherDataResponse && typeof otherDataResponse === 'object' && 'results' in otherDataResponse) {
               // It was paginated, access the .results property
               recommendationResults = (otherDataResponse as PaginatedResponse<Place>).results;
           } else {
               // Handle unexpected response structure
               console.warn("Unexpected response structure for recommendations:", otherDataResponse);
               recommendationResults = [];
           }
          setRecommendations(recommendationResults); // Set state with the array
          fetchedUserPlaces = []; // Ensure places are empty for seeker
          setMyPlaces([]);
        } else if (user.user_type === "provider" && otherDataResponse) {
          // Places likely paginated, access .results
          const allPlaces = (otherDataResponse as PaginatedResponse<Place>).results;
          // Client-side filter (Backend filter is better)
          fetchedUserPlaces = allPlaces.filter(place => place.owner?.id === user.id);
          setMyPlaces(fetchedUserPlaces);
          setRecommendations([]);
        } else {
          // Handle admin or cases where otherDataResponse is null
          fetchedUserPlaces = [];
          setMyPlaces([]);
          setRecommendations([]);
        }

        // --- Combine for Activity Feed ---
         const activities: ActivityItem[] = [
            // Map reviews to ReviewActivity
            ...fetchedUserReviews.map((r): ReviewActivity => ({ ...r, type: 'review', date: new Date(r.created_at) })),
            // Map places (only if provider) to PlaceActivity
            ...fetchedUserPlaces.map((p): PlaceActivity => ({ ...p, type: 'place', date: new Date(p.created_at) }))
         ].sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort newest first
         setCombinedActivities(activities);


      } catch (err: any) {
            console.error("Error fetching dashboard data:", err);
            let errorMsg = "Failed to load dashboard data.";
            if (err.response && err.response.data && err.response.data.detail) {
                errorMsg = err.response.data.detail;
            } else if (err.message) {
                 errorMsg = err.message.includes('Network Error') ? 'Network connection issue.' : err.message;
            }
            setError(errorMsg);
            // Clear data on error to avoid rendering stale/incorrect info
            setMyPlaces([]);
            setMyReviews([]);
            setRecommendations([]);
            setCombinedActivities([]);
      } finally {
        setLoading(false); // Finish dashboard data loading
      }
    };

    // Fetch data now that user is confirmed
    fetchData();

  }, [user, authLoading, router]); // Dependencies ensure effect runs when needed

  // --- RENDER LOADING ---
  if (loading || authLoading) {
    return (
      <div className="container py-8 animate-pulse"> {/* Added pulse animation */}
        <Skeleton className="h-12 w-64 mb-6 rounded-md" /> {/* Added rounding */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {[1, 2, 3].map((i) => ( <Skeleton key={i} className="h-32 w-full rounded-lg" /> ))}
        </div>
        <Skeleton className="h-10 w-full max-w-md mb-6 rounded-md" /> {/* Tabs Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => ( <Skeleton key={i} className="h-60 w-full rounded-lg" /> ))} {/* Adjusted height */}
        </div>
      </div>
    );
  }

   // --- RENDER ERROR ---
   if (error) {
     return (
       <div className="container py-8 text-center">
         <div className="max-w-md mx-auto bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6 shadow-md">
             <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
             <h1 className="text-xl font-semibold mb-3 text-red-700 dark:text-red-300">Dashboard Error</h1>
             <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
             <Button onClick={() => window.location.reload()} variant="destructive" >
             Try Again
             </Button>
         </div>
       </div>
     );
   }

  // Should not be reached if redirects work, but provides a fallback
  if (!user) {
      console.error("Dashboard rendered without user after loading states finished.");
      return <div className="container py-8 text-center text-red-500">Authentication error. Please try logging in again.</div>;
  }

  // --- RENDER CONTENT ---
  const totalReviewsReceived = myPlaces.reduce((total, place) => total + (place.review_count ?? 0), 0);
  const defaultTab = user.user_type === "provider" ? "places" : "recommendations";

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold mb-2">Welcome, {user.first_name || user.username}!</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {user.user_type === "provider"
              ? "Manage your places and review activity."
              : "Discover recommendations and track your reviews."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/profile">
            <Button variant="outline"> <Settings className="h-4 w-4 mr-2" /> Profile Settings </Button>
          </Link>
          <Button variant="outline" onClick={logout} className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {/* Card 1: Places */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {user.user_type === "provider" ? "Your Listed Places" : "Saved Places"} {/* TODO: Implement Saved Places */}
                </p>
                <h3 className="text-2xl font-bold mt-1">{user.user_type === "provider" ? myPlaces.length : 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Building className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Card 2: Reviews Written */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Reviews Written</p>
                <h3 className="text-2xl font-bold mt-1">{myReviews.length}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Card 3: Reviews Received / Recommendations */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {user.user_type === "provider" ? "Total Reviews Received" : "Recommended Places"}
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {user.user_type === "provider"
                    ? totalReviewsReceived
                    : recommendations.length}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                {user.user_type === "provider" ? (
                  <Star className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-6"> {/* Adjust cols */}
          {user.user_type === "provider" && <TabsTrigger value="places">My Places</TabsTrigger>}
          {user.user_type === "seeker" && <TabsTrigger value="recommendations">Recommendations</TabsTrigger>}
          <TabsTrigger value="reviews">My Reviews</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Provider: Places Tab */}
        {user.user_type === "provider" && (
          <TabsContent value="places" className="mt-0">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <h2 className="text-xl font-semibold">Your Listed Places</h2>
              <Link href="/places/add"> {/* TODO: Implement /places/add route */}
                <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white">
                  <Plus className="h-4 w-4 mr-2" /> Add New Place
                </Button>
              </Link>
            </div>
             {myPlaces.length === 0 ? (
                <Card className="border-dashed border-gray-300 dark:border-gray-700"><CardContent className="p-8 text-center">
                    <Building className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No places added yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Start adding your accessible places!</p>
                    <Link href="/places/add"><Button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white">Add Your First Place</Button></Link>
                </CardContent></Card>
             ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {myPlaces.map((place) => (
                    <Card key={place.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-40 bg-gray-100 dark:bg-gray-800 relative">
                        <img src={`/placeholder.svg?height=160&width=400&text=${encodeURIComponent(place.name)}`} alt={place.name} className="h-full w-full object-cover" loading="lazy"/>
                        <Badge className="absolute top-2 right-2 capitalize bg-green-600 text-white px-2 py-0.5 text-xs rounded">{place.place_type.replace('_', ' ')}</Badge>
                        </div>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-lg">{place.name}</h3>
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400"><Star className="h-4 w-4 text-yellow-500 mr-1" /><span>{place.review_count} {place.review_count === 1 ? 'review' : 'reviews'}</span></div>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3"><MapPin className="h-4 w-4 mr-1 flex-shrink-0" /><span className="truncate">{place.address}</span></div>
                            <div className="flex flex-wrap gap-1 mb-3 min-h-[22px]">
                                {place.accessibility_features.slice(0, 2).map((feature) => (<Badge key={feature.id} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700">{feature.name}</Badge>))}
                                {place.accessibility_features.length > 2 && (<Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">+{place.accessibility_features.length - 2} more</Badge>)}
                                {place.accessibility_features.length === 0 && (<Badge variant="secondary" className="text-xs">No features listed</Badge>)}
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <Link href={`/places/${place.id}`}><Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 font-semibold"> View <ExternalLink className="h-3 w-3 ml-1" /> </Button></Link>
                                <Link href={`/places/${place.id}/edit`}><Button size="sm" variant="outline"> <Edit className="h-3 w-3 mr-1" /> Edit </Button></Link> {/* TODO: Implement edit route */}
                            </div>
                        </CardContent>
                    </Card>
                    ))}
                </div>
            )}
          </TabsContent>
        )}

        {/* Seeker: Recommendations Tab */}
        {user.user_type === "seeker" && (
          <TabsContent value="recommendations" className="mt-0">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <h2 className="text-xl font-semibold">Recommended Places For You</h2>
              <Link href="/profile"> <Button variant="outline"> <Settings className="h-4 w-4 mr-2" /> Update Needs </Button> </Link>
            </div>
            {recommendations.length === 0 ? (
                 <Card className="border-dashed border-gray-300 dark:border-gray-700"><CardContent className="p-8 text-center">
                    <Heart className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Update your accessibility needs in your profile to get personalized recommendations.</p>
                    <Link href="/profile"><Button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"><Settings className="h-4 w-4 mr-2" /> Set Your Needs</Button></Link>
                 </CardContent></Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {recommendations.map((place) => ( // This .map() is now safe
                    <Link key={place.id} href={`/places/${place.id}`} className="block group">
                        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                            <div className="h-40 bg-gray-100 dark:bg-gray-800 relative flex-shrink-0">
                                <img src={`/placeholder.svg?height=160&width=400&text=${encodeURIComponent(place.name)}`} alt={place.name} className="h-full w-full object-cover" loading="lazy"/>
                                <Badge className="absolute top-2 right-2 capitalize bg-green-600 text-white px-2 py-0.5 text-xs rounded">{place.place_type.replace('_', ' ')}</Badge>
                            </div>
                            <CardContent className="p-4 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-lg group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{place.name}</h3>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 flex-shrink-0 ml-2"><Star className="h-4 w-4 text-yellow-500 mr-1" /><span>{place.review_count}</span></div>
                                </div>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3"><MapPin className="h-4 w-4 mr-1 flex-shrink-0" /><span className="truncate">{place.address}</span></div>
                                <div className="flex flex-wrap gap-1 mb-3 min-h-[22px]">
                                    {place.accessibility_features.slice(0, 2).map((feature) => (<Badge key={feature.id} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700">{feature.name}</Badge>))}
                                    {place.accessibility_features.length > 2 && (<Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">+{place.accessibility_features.length - 2} more</Badge>)}
                                    {place.accessibility_features.length === 0 && (<Badge variant="secondary" className="text-xs">No features listed</Badge>)}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-300 line-clamp-2 mb-3 flex-grow">{place.description ?? <span className="italic">No description provided.</span>}</p>
                                <div className="flex justify-end mt-auto pt-2">
                                    <Button size="sm" variant="ghost" className="text-green-600 group-hover:text-green-700 dark:text-green-500 dark:group-hover:text-green-400 font-semibold"> View Details <ExternalLink className="h-3 w-3 ml-1" /> </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                    ))}
                </div>
            )}
          </TabsContent>
        )}

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="mt-0">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold">Your Reviews Written</h2>
             <Link href="/places"> <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"> <Plus className="h-4 w-4 mr-2" /> Find Places to Review </Button> </Link>
          </div>
           {myReviews.length === 0 ? (
              <Card className="border-dashed border-gray-300 dark:border-gray-700"><CardContent className="p-8 text-center">
                  <Star className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Share your experiences to help others!</p>
                  <Link href="/places"><Button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white">Write Your First Review</Button></Link>
              </CardContent></Card>
           ) : (
                <div className="space-y-6">
                {myReviews.map((review) => ( // Uses DashboardReview type
                    <Card key={review.id} className="shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                        <Link href={`/places/${review.place.id}`} className="font-semibold text-lg hover:text-green-600 dark:hover:text-green-400 transition-colors">{review.place.name}</Link> {/* Safe access */}
                        <div className="flex items-center gap-x-4 gap-y-1 flex-wrap">
                            <div className="flex items-center">
                                <span className="text-sm font-medium mr-1.5 text-gray-600 dark:text-gray-400">Rating:</span>
                                <div className="flex">{[...Array(5)].map((_, i) => (<Star key={`or-${i}`} className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300 dark:text-gray-600"}`}/>))}</div>
                            </div>
                           {review.accessibility_rating !== null && (
                               <div className="flex items-center">
                                    <span className="text-sm font-medium mr-1.5 text-gray-600 dark:text-gray-400">Accessibility:</span>
                                    <div className="flex">{[...Array(5)].map((_, i) => (<Star key={`ar-${i}`} className={`h-4 w-4 ${i < (review.accessibility_rating ?? 0) ? "text-green-500 fill-green-500" : "text-gray-300 dark:text-gray-600"}`}/>))}</div>
                                </div>
                            )}
                        </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap text-sm">{review.comment ?? <span className="italic text-gray-500">No comment provided.</span>}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-3 mt-3">
                        <div className="flex items-center"><Clock className="h-4 w-4 mr-1" /><span>{new Date(review.created_at).toLocaleDateString()}</span></div>
                        <div className="flex gap-2">
                            <Link href={`/reviews/${review.id}/edit`}><Button size="sm" variant="ghost"> <Edit className="h-3 w-3 mr-1" /> Edit </Button></Link> {/* TODO: Implement edit route */}
                            <Link href={`/places/${review.place.id}`}><Button size="sm" variant="ghost" className="text-green-600 dark:text-green-500 font-semibold"> View Place <ExternalLink className="h-3 w-3 ml-1" /> </Button></Link>
                        </div>
                        </div>
                    </CardContent>
                    </Card>
                ))}
                </div>
            )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-0">
          <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
           {combinedActivities.length === 0 ? (
                <Card className="border-dashed border-gray-300 dark:border-gray-700"><CardContent className="p-8 text-center">
                    <Activity className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No activity yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Your recent contributions will appear here.</p>
                 </CardContent></Card>
           ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="relative pl-6 border-l border-gray-200 dark:border-gray-700 space-y-6">
                    {/* Map over combined activities */}
                    {combinedActivities.map((activity) => (
                      <div key={`${activity.type}-${activity.id}`} className="relative">
                        {/* Icon based on type */}
                         <div className={`absolute -left-[25px] top-0 h-6 w-6 rounded-full flex items-center justify-center border-2 border-background ${activity.type === 'review' ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
                            {activity.type === 'review' ? <Star className="h-3 w-3 text-yellow-600 dark:text-yellow-400" /> : <Building className="h-3 w-3 text-blue-600 dark:text-blue-400" />}
                        </div>
                        <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="inline h-3 w-3 mr-1" /> {activity.date.toLocaleDateString()}
                        </div>
                         {/* Content based on type (using type guards) */}
                         {activity.type === 'review' && ( // Type guard for ReviewActivity
                             <>
                                <p className="font-medium text-sm">
                                You reviewed{" "}
                                <Link href={`/places/${activity.place.id}`} className="text-green-600 hover:underline dark:text-green-500 dark:hover:text-green-400 font-semibold">
                                    {activity.place.name} {/* Safe access */}
                                </Link>
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Gave {activity.rating}/5 stars overall{activity.accessibility_rating !== null && ` and ${activity.accessibility_rating}/5 for accessibility.`} {/* Safe access */}
                                </p>
                             </>
                         )}
                         {activity.type === 'place' && ( // Type guard for PlaceActivity
                             <>
                                <p className="font-medium text-sm">
                                You {activity.created_at === activity.updated_at ? 'added' : 'updated'}{" "}
                                <Link href={`/places/${activity.id}`} className="text-green-600 hover:underline dark:text-green-500 dark:hover:text-green-400 font-semibold">
                                    {activity.name} {/* Safe access */}
                                </Link>
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Listed with {activity.accessibility_features.length} features, {activity.review_count} reviews. {/* Safe access */}
                                </p>
                             </>
                         )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
           )}
        </TabsContent>
      </Tabs>
    </div>
  );
}