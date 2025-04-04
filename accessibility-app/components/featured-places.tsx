"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Star, ExternalLink } from "lucide-react"

type Place = {
  id: number
  name: string
  address: string
  place_type: string
  description: string
  accessibility_features: Array<{
    id: number
    name: string
    description: string
  }>
  review_count: number
}

export default function FeaturedPlaces() {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        // In a real app, you would fetch from your API
        // For now, we'll use mock data

        // Mock data
        const mockData = [
          {
            id: 1,
            name: "Inclusive Cafe",
            address: "123 Main St, Anytown, USA",
            place_type: "restaurant",
            description: "A welcoming cafe with a variety of accessibility features.",
            accessibility_features: [
              { id: 1, name: "Wheelchair Access", description: "Ramps and wide doorways" },
              { id: 2, name: "Braille Menu", description: "Menu available in braille" },
              { id: 3, name: "Service Animals Welcome", description: "Service animals are welcome" },
            ],
            review_count: 24,
          },
          {
            id: 2,
            name: "Community Library",
            address: "456 Oak Ave, Anytown, USA",
            place_type: "library",
            description: "A public library with extensive accessibility accommodations.",
            accessibility_features: [
              { id: 1, name: "Wheelchair Access", description: "Ramps and wide doorways" },
              { id: 4, name: "Assistive Technology", description: "Screen readers and magnifiers" },
              { id: 5, name: "Quiet Room", description: "Sensory-friendly quiet space" },
            ],
            review_count: 18,
          },
          {
            id: 3,
            name: "Universal Theater",
            address: "789 Pine Blvd, Anytown, USA",
            place_type: "entertainment",
            description: "A theater with accommodations for various accessibility needs.",
            accessibility_features: [
              { id: 1, name: "Wheelchair Access", description: "Ramps and wide doorways" },
              { id: 6, name: "Closed Captioning", description: "Available for all showings" },
              { id: 7, name: "Audio Description", description: "Available upon request" },
            ],
            review_count: 32,
          },
        ]

        setPlaces(mockData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching places:", error)
        setLoading(false)
      }
    }

    fetchPlaces()
  }, [])

  useEffect(() => {
    // Add 3D tilt effect to cards
    const handleMouseMove = (e: MouseEvent, index: number) => {
      const card = cardsRef.current[index]
      if (!card) return

      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const rotateX = (y - centerY) / 20
      const rotateY = (centerX - x) / 20

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    }

    const handleMouseLeave = (index: number) => {
      const card = cardsRef.current[index]
      if (!card) return
      card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)"
    }

    cardsRef.current.forEach((card, index) => {
      if (!card) return

      card.addEventListener("mousemove", (e) => handleMouseMove(e, index))
      card.addEventListener("mouseleave", () => handleMouseLeave(index))
    })

    return () => {
      cardsRef.current.forEach((card, index) => {
        if (!card) return

        card.removeEventListener("mousemove", (e) => handleMouseMove(e, index))
        card.removeEventListener("mouseleave", () => handleMouseLeave(index))
      })
    }
  }, [places])

  if (loading) {
    return (
      <div className="grid gap-6 pt-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden bg-gray-900 border-gray-800">
            <CardHeader className="p-0">
              <Skeleton className="h-48 w-full rounded-none bg-gray-800" />
            </CardHeader>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-2/3 mb-2 bg-gray-800" />
              <Skeleton className="h-4 w-full mb-4 bg-gray-800" />
              <div className="flex flex-wrap gap-2 mb-4">
                <Skeleton className="h-6 w-24 bg-gray-800" />
                <Skeleton className="h-6 w-32 bg-gray-800" />
                <Skeleton className="h-6 w-28 bg-gray-800" />
              </div>
              <Skeleton className="h-4 w-full bg-gray-800" />
              <Skeleton className="h-4 w-full mt-1 bg-gray-800" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 pt-6 md:grid-cols-2 lg:grid-cols-3">
      {places.map((place, index) => (
        <Card
          key={place.id}
          className="overflow-hidden bg-gray-900/50 backdrop-blur-sm border-gray-800 transition-all duration-300 card-3d"
          ref={(el) => (cardsRef.current[index] = el)}
        >
          <CardHeader className="p-0">
            <div className="h-48 w-full bg-gray-800 relative overflow-hidden">
              <img
                src={`/placeholder.svg?height=200&width=400&text=${encodeURIComponent(place.name)}`}
                alt={place.name}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <Badge className="absolute top-2 right-2 bg-purple-600/80 backdrop-blur-sm">{place.place_type}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 relative z-10">
            <CardTitle className="text-xl mb-2 text-white">{place.name}</CardTitle>
            <div className="flex items-center text-sm text-gray-400 mb-4">
              <MapPin className="h-4 w-4 mr-1 text-purple-400" />
              <span>{place.address}</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {place.accessibility_features.slice(0, 3).map((feature) => (
                <Badge
                  key={feature.id}
                  variant="outline"
                  className="bg-purple-900/30 text-purple-300 border-purple-800"
                >
                  {feature.name}
                </Badge>
              ))}
              {place.accessibility_features.length > 3 && (
                <Badge variant="outline" className="bg-gray-800/50 text-gray-400 border-gray-700">
                  +{place.accessibility_features.length - 3} more
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-400 line-clamp-2">{place.description}</p>
          </CardContent>
          <CardFooter className="flex justify-between items-center px-6 pb-6 pt-0">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-sm text-gray-400">{place.review_count} reviews</span>
            </div>
            <Link href={`/places/${place.id}`}>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 btn-animated">
                View Details
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

