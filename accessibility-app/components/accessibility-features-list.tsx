"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ShipWheelIcon as Wheelchair,
  Eye,
  Ear,
  Brain,
  Baby,
  Dog,
  Utensils,
  ParkingMeterIcon as Parking,
} from "lucide-react"

type AccessibilityFeature = {
  id: number
  name: string
  description: string
  category: string
}

// Helper function to get the appropriate icon for a feature category
const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "mobility":
      return <Wheelchair className="h-5 w-5 text-purple-400" />
    case "visual":
      return <Eye className="h-5 w-5 text-purple-400" />
    case "auditory":
      return <Ear className="h-5 w-5 text-purple-400" />
    case "cognitive":
      return <Brain className="h-5 w-5 text-purple-400" />
    case "family":
      return <Baby className="h-5 w-5 text-purple-400" />
    case "service":
      return <Dog className="h-5 w-5 text-purple-400" />
    case "dietary":
      return <Utensils className="h-5 w-5 text-purple-400" />
    default:
      return <Parking className="h-5 w-5 text-purple-400" />
  }
}

export default function AccessibilityFeaturesList() {
  const [features, setFeatures] = useState<AccessibilityFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        // In a real app, you would fetch from your API
        // For now, we'll use mock data

        // Mock data with categories
        const mockData = [
          // Mobility features
          {
            id: 1,
            name: "Wheelchair Access",
            description: "Ramps, wide doorways, and accessible entrances",
            category: "Mobility",
          },
          {
            id: 2,
            name: "Accessible Restrooms",
            description: "Restrooms designed for wheelchair users",
            category: "Mobility",
          },
          {
            id: 3,
            name: "Elevator Access",
            description: "Elevators available for multi-level buildings",
            category: "Mobility",
          },
          {
            id: 4,
            name: "Accessible Parking",
            description: "Designated accessible parking spaces",
            category: "Mobility",
          },

          // Visual features
          {
            id: 5,
            name: "Braille Signage",
            description: "Signs with braille for visually impaired individuals",
            category: "Visual",
          },
          {
            id: 6,
            name: "High Contrast Markings",
            description: "Visual cues with high contrast for low vision",
            category: "Visual",
          },
          {
            id: 7,
            name: "Screen Reader Compatible",
            description: "Digital content compatible with screen readers",
            category: "Visual",
          },

          // Auditory features
          {
            id: 8,
            name: "Hearing Loop System",
            description: "Assistive listening systems for hearing aid users",
            category: "Auditory",
          },
          {
            id: 9,
            name: "Sign Language Staff",
            description: "Staff members who know sign language",
            category: "Auditory",
          },
          {
            id: 10,
            name: "Visual Alerts",
            description: "Visual notifications for auditory alerts",
            category: "Auditory",
          },

          // Cognitive features
          { id: 11, name: "Quiet Spaces", description: "Designated low-sensory areas", category: "Cognitive" },
          {
            id: 12,
            name: "Simple Navigation",
            description: "Clear, intuitive wayfinding and signage",
            category: "Cognitive",
          },
          {
            id: 13,
            name: "Sensory-Friendly Hours",
            description: "Designated times with reduced sensory stimulation",
            category: "Cognitive",
          },

          // Family-friendly features
          { id: 14, name: "Changing Tables", description: "Baby changing facilities in restrooms", category: "Family" },
          { id: 15, name: "Family Restrooms", description: "Private restrooms for families", category: "Family" },

          // Service animal features
          {
            id: 16,
            name: "Service Animals Welcome",
            description: "Policies accommodating service animals",
            category: "Service",
          },
          {
            id: 17,
            name: "Service Animal Relief Area",
            description: "Designated areas for service animals",
            category: "Service",
          },

          // Dietary features
          {
            id: 18,
            name: "Allergy-Friendly Options",
            description: "Menu options for common food allergies",
            category: "Dietary",
          },
          {
            id: 19,
            name: "Dietary Restriction Menus",
            description: "Menus for various dietary needs",
            category: "Dietary",
          },
        ]

        setFeatures(mockData)

        // Extract unique categories
        const uniqueCategories = Array.from(new Set(mockData.map((feature) => feature.category)))
        setCategories(uniqueCategories)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching accessibility features:", error)
        setLoading(false)
      }
    }

    fetchFeatures()
  }, [])

  if (loading) {
    return (
      <div className="w-full pt-6">
        <Skeleton className="h-10 w-64 mb-6 mx-auto bg-gray-800" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="h-8 w-8 rounded-full bg-gray-800" />
                  <Skeleton className="h-6 w-40 bg-gray-800" />
                </div>
                <Skeleton className="h-4 w-full mb-1 bg-gray-800" />
                <Skeleton className="h-4 w-full bg-gray-800" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full pt-6">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-lg mx-auto mb-6 grid-cols-3 md:grid-cols-4 bg-gray-900 border border-gray-800">
          <TabsTrigger value="all" className="data-[state=active]:bg-purple-900 data-[state=active]:text-purple-300">
            All
          </TabsTrigger>
          {categories.slice(0, 3).map((category) => (
            <TabsTrigger
              key={category}
              value={category.toLowerCase()}
              className="data-[state=active]:bg-purple-900 data-[state=active]:text-purple-300"
            >
              {category}
            </TabsTrigger>
          ))}
          {categories.length > 3 && (
            <TabsTrigger value="more" className="data-[state=active]:bg-purple-900 data-[state=active]:text-purple-300">
              More
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.id} className="bg-gray-900/50 backdrop-blur-sm border-gray-800 card-3d">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-purple-900/50 flex items-center justify-center accent-border">
                      {getCategoryIcon(feature.category)}
                    </div>
                    <h3 className="font-medium text-white">{feature.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category} value={category.toLowerCase()} className="mt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features
                .filter((feature) => feature.category.toLowerCase() === category.toLowerCase())
                .map((feature) => (
                  <Card key={feature.id} className="bg-gray-900/50 backdrop-blur-sm border-gray-800 card-3d">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-purple-900/50 flex items-center justify-center accent-border">
                          {getCategoryIcon(feature.category)}
                        </div>
                        <h3 className="font-medium text-white">{feature.name}</h3>
                      </div>
                      <p className="text-sm text-gray-400">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}

        <TabsContent value="more" className="mt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features
              .filter((feature) => !categories.slice(0, 3).includes(feature.category))
              .map((feature) => (
                <Card key={feature.id} className="bg-gray-900/50 backdrop-blur-sm border-gray-800 card-3d">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-purple-900/50 flex items-center justify-center accent-border">
                        {getCategoryIcon(feature.category)}
                      </div>
                      <h3 className="font-medium text-white">{feature.name}</h3>
                    </div>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

