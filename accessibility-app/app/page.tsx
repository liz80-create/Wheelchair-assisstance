
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Star, Users, Building } from "lucide-react"
// Assuming these components exist and fetch their own data
import FeaturedPlaces from "@/components/featured-places"
import AccessibilityFeaturesList from "@/components/accessibility-features-list"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white"> {/* Base styling */}
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
        {/* Cyberpunk Grid Background */}
        <div className="absolute inset-0 cyber-grid opacity-20 z-0"></div>

        {/* Hero Content */}
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-white">
                  Find Places That <span className="text-highlight text-purple-400">Welcome Everyone</span> {/* Example highlight */}
                </h1>
                <p className="max-w-[600px] text-gray-300 md:text-xl"> {/* Adjusted color */}
                  Discover and share accessible places in your community. Whether you're looking for wheelchair access,
                  sensory-friendly environments, or other accessibility features.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/places">
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white btn-animated">
                    <Search className="mr-2 h-4 w-4" />
                    Find Places
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="border-purple-700 text-purple-400 hover:bg-gray-800 hover:text-purple-300">
                    Join Our Community
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              {/* Placeholder Image */}
              <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-xl overflow-hidden shadow-xl transform perspective-1000 card-3d bg-gray-800">
                {/* Replace with an actual relevant image */}
                <img
                  alt="Diverse group of people happily interacting in an accessible cafe environment"
                  className="object-cover w-full h-full opacity-80" // Example opacity
                  src="/placeholder-hero.jpg" // Suggest using a specific placeholder name or actual image path
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                 {/* Optional Text Overlay */}
                 {/* <div className="absolute bottom-4 left-4 text-white p-2 bg-black/50 rounded">Making spaces inclusive</div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-950 gradient-bg">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                How It <span className="text-highlight text-purple-400">Works</span>
              </h2>
              <p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform connects people with accessible places and helps businesses showcase their accessibility
                features.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12"> {/* Changed items-center to start */}
            {/* Card 1 */}
            <div className="flex flex-col justify-center space-y-4 rounded-lg border border-gray-800 p-6 shadow-lg bg-gray-900/50 backdrop-blur-sm card-3d h-full"> {/* Added h-full */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-900/50 border border-purple-700"> {/* Added border */}
                <Search className="h-6 w-6 text-purple-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Find Places</h3>
                <p className="text-gray-400">
                  Search for places with the accessibility features you need, filtered by your specific requirements.
                </p>
              </div>
            </div>
             {/* Card 2 */}
            <div className="flex flex-col justify-center space-y-4 rounded-lg border border-gray-800 p-6 shadow-lg bg-gray-900/50 backdrop-blur-sm card-3d h-full"> {/* Added h-full */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-900/50 border border-purple-700">
                <Star className="h-6 w-6 text-purple-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Review & Verify</h3>
                <p className="text-gray-400">
                  Share your experiences and verify accessibility features to help others make informed decisions.
                </p>
              </div>
            </div>
             {/* Card 3 */}
            <div className="flex flex-col justify-center space-y-4 rounded-lg border border-gray-800 p-6 shadow-lg bg-gray-900/50 backdrop-blur-sm card-3d h-full"> {/* Added h-full */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-900/50 border border-purple-700">
                <Building className="h-6 w-6 text-purple-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Add Your Business</h3>
                <p className="text-gray-400">
                  Business owners can list their venues, showcase accessibility features, and connect with a diverse customer base.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Places */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-10 z-0"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                Featured <span className="text-highlight text-purple-400">Accessible Places</span>
              </h2>
              <p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Discover highly-rated places with verified accessibility features shared by our community.
              </p>
            </div>
          </div>
           {/* This component should fetch its own data internally */}
           {/* Example API endpoint: /api/v1/places/?limit=3&ordering=-average_rating (requires average rating calculation) */}
          <FeaturedPlaces />
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-950 gradient-bg">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                Accessibility <span className="text-highlight text-purple-400">Features</span> We Track
              </h2>
              <p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We cover a wide range of accessibility needs to help you find places that truly meet your requirements.
              </p>
            </div>
          </div>
           {/* This component should fetch its own data internally */}
           {/* Example API endpoint: /api/v1/features/ */}
          <AccessibilityFeaturesList />
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-20 z-0"></div>
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6 relative z-10"> {/* Adjusted container */}
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
              Join Our <span className="text-highlight text-purple-400">Community</span>
            </h2>
            <p className="mx-auto max-w-[600px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Create an account to save your favorite places, write reviews, verify features, and get personalized recommendations.
              Help make the world more accessible!
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center"> {/* Added justify-center */}
            <Link href="/register">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white btn-animated">
                <Users className="mr-2 h-4 w-4" />
                Sign Up Now
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-purple-700 text-purple-400 hover:bg-gray-800 hover:text-purple-300">
                Already Have an Account? Log In
              </Button>
            </Link>
          </div>
        </div>
      </section>

       {/* Footer - Assuming you have a Footer component */}
       {/* <Footer /> */}
    </div>
  )
}

// --- Placeholder Components (Create these in src/components) ---

// Example: src/components/featured-places.tsx
/*
"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';
import type { Place } from '@/types/api'; // Adjust path as needed
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeaturedPlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      setError(null);
      try {
        // Example: Fetch top 3 places, maybe ordered by review count or a special flag
        // Adjust the endpoint and query params as needed based on your API capabilities
        const response = await apiClient.get<any>('/places/?limit=3&ordering=-review_count'); // Check if paginated
        const results = response.results || response; // Handle pagination or direct array
        if (!Array.isArray(results)) throw new Error("Invalid data format for featured places");
        setPlaces(results);
      } catch (err: any) {
        console.error("Error fetching featured places:", err);
        setError(err.message || "Could not load featured places.");
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading) {
      return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <Skeleton className="h-72 rounded-lg"/>
              <Skeleton className="h-72 rounded-lg"/>
              <Skeleton className="h-72 rounded-lg"/>
          </div>
      );
  }

  if (error) return <p className="text-center text-red-500 mt-12">{error}</p>;
  if (places.length === 0) return <p className="text-center text-gray-500 mt-12">No featured places available yet.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
      {places.map(place => (
        <Link key={place.id} href={`/places/${place.id}`} className="block group">
           <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow h-full flex flex-col bg-gray-900 border-gray-800">
             <div className="h-40 bg-gray-700 relative flex-shrink-0">
                <img src={`/placeholder.svg?height=160&width=400&text=${encodeURIComponent(place.name)}`} alt={place.name} className="h-full w-full object-cover" loading="lazy"/>
                <Badge className="absolute top-2 right-2 capitalize bg-purple-600 text-white px-2 py-0.5 text-xs rounded">{place.place_type.replace('_', ' ')}</Badge>
             </div>
             <CardContent className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-lg mb-1 group-hover:text-purple-400 transition-colors">{place.name}</h3>
                <div className="flex items-center text-sm text-gray-400 mb-2"><MapPin className="h-4 w-4 mr-1 flex-shrink-0" /><span className="truncate">{place.address}</span></div>
                <div className="flex flex-wrap gap-1 mb-3 min-h-[22px]">
                    {place.accessibility_features.slice(0, 2).map((feature) => (<Badge key={feature.id} variant="outline" className="text-xs bg-gray-800 text-purple-300 border-purple-700">{feature.name}</Badge>))}
                    {place.accessibility_features.length > 2 && (<Badge variant="outline" className="text-xs bg-gray-700 text-gray-300 border-gray-600">+{place.accessibility_features.length - 2} more</Badge>)}
                    {place.accessibility_features.length === 0 && (<Badge variant="secondary" className="text-xs">No features listed</Badge>)}
                </div>
                <div className="flex items-center text-sm text-gray-400 mt-auto pt-2">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span>{place.review_count} {place.review_count === 1 ? 'review' : 'reviews'}</span>
                </div>
             </CardContent>
           </Card>
         </Link>
      ))}
    </div>
  );
}
*/

// Example: src/components/accessibility-features-list.tsx
/*
"use client"
import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import type { AccessibilityFeature } from '@/types/api'; // Adjust path
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Check } from 'lucide-react';

export default function AccessibilityFeaturesList() {
    const [features, setFeatures] = useState<AccessibilityFeature[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        apiClient.get<AccessibilityFeature[]>('/features/') // Assuming not paginated
            .then(data => setFeatures(data.sort((a, b) => a.name.localeCompare(b.name)))) // Sort alphabetically
            .catch(err => setError(err.message || "Failed to load features"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex flex-wrap justify-center gap-2 mt-12">
                {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-8 w-32 rounded-full" />)}
            </div>
        );
    }

    if (error) return <p className="text-center text-red-500 mt-12">{error}</p>;
    if (features.length === 0) return <p className="text-center text-gray-500 mt-12">No features available.</p>;

    // Display a subset or all features
    const displayFeatures = features.slice(0, 15); // Example: Show first 15

    return (
        <div className="flex flex-wrap justify-center gap-2 mt-12">
            {displayFeatures.map(feature => (
                <Badge key={feature.id} variant="secondary" className="text-sm px-4 py-1 border border-gray-700 bg-gray-800/50 text-gray-300">
                    <Check className="h-3 w-3 mr-1.5 text-purple-400" />
                    {feature.name}
                </Badge>
            ))}
            {features.length > displayFeatures.length && (
                 <Badge variant="outline" className="text-sm px-4 py-1 border border-gray-700 text-gray-400">
                    + {features.length - displayFeatures.length} more...
                 </Badge>
            )}
        </div>
    );
}
*/
