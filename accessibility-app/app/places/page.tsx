"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Search, Star, Filter, Building, ExternalLink, AlertCircle } from "lucide-react"
import apiClient from "@/lib/apiClient" // Import API client
import type { Place, AccessibilityFeature } from "@/types/api" // Import API types

// Define the interface for DRF Paginated Response
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [features, setFeatures] = useState<AccessibilityFeature[]>([]) // State holds the array
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch places and features concurrently
        // *** Change 1: Expect PaginatedResponse for BOTH endpoints ***
        const [placesResponse, featuresResponse] = await Promise.all([
          apiClient.get<PaginatedResponse<Place>>('/places/'),
          apiClient.get<PaginatedResponse<AccessibilityFeature>>('/features/') // Expect paginated response
        ])
        // *** Change 2: Extract .results from BOTH responses ***
        setPlaces(placesResponse.results)
        setFeatures(featuresResponse.results) // Set state with the array inside results
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.message || "Failed to load places and features. Please try again later.")
        setPlaces([])
        setFeatures([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Client-side filtering (NO CHANGES HERE)
  const filteredPlaces = places.filter((place) => {
    const placeFeatureIds = new Set(place.accessibility_features.map(f => f.id));

    const matchesSearch =
      !searchTerm ||
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (place.description && place.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      place.address.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(place.place_type)

    const matchesFeatures =
      selectedFeatures.length === 0 ||
      selectedFeatures.every((featureId) => placeFeatureIds.has(featureId))

    return matchesSearch && matchesType && matchesFeatures
  })

  // Get unique place types (NO CHANGES HERE)
  const placeTypes = Array.from(new Set(places.map((place) => place.place_type))).sort()

  // --- RENDER LOADING --- (NO CHANGES HERE)
  if (loading) {
    return (
      <div className="container py-8">
         <h1 className="text-3xl font-bold mb-6">Find Accessible Places</h1>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="w-full md:w-3/4">
            <Skeleton className="h-10 w-full mb-6" />
            <div className="grid gap-6 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- RENDER ERROR --- (NO CHANGES HERE)
   if (error) {
     return (
       <div className="container py-8 text-center">
         <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
         <h1 className="text-2xl font-bold mb-4 text-red-600">Error Loading Places</h1>
         <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
         <Button onClick={() => window.location.reload()}>
           Try Again
         </Button>
       </div>
     );
   }

  // --- RENDER CONTENT --- (NO CHANGES BELOW THIS LINE, including line 348)
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Find Accessible Places</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-1" />
                {showFilters ? "Hide" : "Show"}
              </Button>
            </div>

            <div className={`space-y-6 ${showFilters ? "block" : "hidden"} md:block`}>
              {/* Place Type Filter */}
              <div>
                <h3 className="font-medium mb-2">Place Type</h3>
                <div className="space-y-2">
                  {placeTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          setSelectedTypes(prev => checked ? [...prev, type] : prev.filter(t => t !== type))
                        }}
                      />
                      <Label htmlFor={`type-${type}`} className="capitalize">
                        {type.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accessibility Features Filter */}
              <div>
                <h3 className="font-medium mb-2">Accessibility Features</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {/* This line should now work correctly because 'features' is an array */}
                  {features.sort((a,b) => a.name.localeCompare(b.name)).map((feature) => (
                    <div key={feature.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`feature-${feature.id}`}
                        checked={selectedFeatures.includes(feature.id)}
                         onCheckedChange={(checked) => {
                          setSelectedFeatures(prev => checked ? [...prev, feature.id] : prev.filter(id => id !== feature.id))
                        }}
                      />
                      <Label htmlFor={`feature-${feature.id}`} className="text-sm">
                        {feature.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset Filters */}
              {(selectedTypes.length > 0 || selectedFeatures.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSelectedTypes([])
                    setSelectedFeatures([])
                  }}
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Places List */}
        <div className="w-full md:w-3/4">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search places by name, description, or location..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Results */}
          {filteredPlaces.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No places found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {places.length > 0 ? "Try adjusting your search or filters." : "No places available yet."}
             </p>
              {(searchTerm || selectedTypes.length > 0 || selectedFeatures.length > 0) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedTypes([])
                    setSelectedFeatures([])
                  }}
                >
                  Clear search & filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {filteredPlaces.map((place) => (
                <Link key={place.id} href={`/places/${place.id}`} className="block h-full">
                  <Card className="h-full hover:shadow-md transition-shadow flex flex-col">
                    <CardContent className="p-0 flex-grow flex flex-col">
                      <div className="h-40 bg-gray-100 dark:bg-gray-800 relative flex-shrink-0">
                        <img
                          src={`/placeholder.svg?height=160&width=400&text=${encodeURIComponent(place.name)}`}
                          alt={place.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <Badge className="absolute top-2 right-2 capitalize bg-green-600">{place.place_type.replace('_', ' ')}</Badge>
                      </div>
                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{place.name}</h3>
                            <div className="flex items-center flex-shrink-0 ml-2">
                                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                <span className="text-sm">{typeof place.review_count === 'number' ? place.review_count : 0}</span>
                            </div>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{place.address}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
                            {(place.accessibility_features ?? []).slice(0, 2).map((feature) => (
                                <Badge
                                key={feature.id}
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700"
                                >
                                {feature.name}
                                </Badge>
                            ))}
                            {(place.accessibility_features?.length ?? 0) > 2 && (
                                <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                                +{(place.accessibility_features?.length ?? 0) - 2} more
                                </Badge>
                            )}
                            {(place.accessibility_features?.length ?? 0) === 0 && (
                                <Badge variant="secondary">No features listed</Badge>
                            )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                              {place.description || <span className="italic">No description provided.</span>}
                            </p>
                        </div>
                        <div className="flex justify-end mt-2">
                          <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700">
                            View Details
                            <ExternalLink className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}