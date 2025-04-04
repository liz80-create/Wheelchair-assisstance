"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert" // Added Alert
import { Check, X, Star, Loader2, AlertCircle } from "lucide-react" // Added Loader2, AlertCircle
import apiClient from "@/lib/apiClient" // Import API client
import type { Review, AccessibilityFeature as ApiAccessibilityFeature } from "@/types/api" // Import API types

// Use the API type for features
interface ReviewFormProps {
  placeId: number
  accessibilityFeatures: ApiAccessibilityFeature[] // Use API type
  onSubmit: (newReview: Review) => void // Callback expects the created Review object
  onCancel: () => void
}

export default function ReviewForm({ placeId, accessibilityFeatures, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(0)
  const [accessibilityRating, setAccessibilityRating] = useState<number>(0)
  const [comment, setComment] = useState("")
  const [verifiedFeatureIds, setVerifiedFeatureIds] = useState<number[]>([]) // Rename state
  const [missingFeatureIds, setMissingFeatureIds] = useState<number[]>([])   // Rename state
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({}) // Keep client validation errors
  const [apiError, setApiError] = useState<string | null>(null) // State for API errors
  const [isSubmitting, setIsSubmitting] = useState(false) // State for loading indicator

  const validateForm = (): boolean => {
     const newErrors: Record<string, string> = {}
     if (rating === 0) {
       newErrors.rating = "Please select an overall rating (1-5 stars)"
     }
     // Accessibility rating is optional according to model/serializer (allow 0)
     // if (accessibilityRating === 0) {
     //   newErrors.accessibilityRating = "Please select an accessibility rating"
     // }
     // Comment is optional according to model/serializer
     // if (!comment.trim()) {
     //   newErrors.comment = "Please provide a comment"
     // }
     const duplicates = verifiedFeatureIds.filter((id) => missingFeatureIds.includes(id))
     if (duplicates.length > 0) {
       newErrors.features = "A feature cannot be marked as both verified and missing"
     }
     setClientErrors(newErrors)
     return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null) // Clear previous API error
    setClientErrors({}) // Clear previous client errors

    if (!validateForm()) {
      return // Stop if client validation fails
    }

    setIsSubmitting(true) // Start loading

    try {
       // Prepare payload matching the serializer writeable fields
      const payload = {
        place: placeId,
        rating,
        // Send null if accessibility rating is 0 (or not selected)
        accessibility_rating: accessibilityRating === 0 ? null : accessibilityRating,
        // Send null if comment is empty/whitespace
        comment: comment.trim() === '' ? null : comment.trim(),
        // Use correct state variable names matching serializer fields
        verified_feature_ids: verifiedFeatureIds,
        missing_feature_ids: missingFeatureIds,
      }

      // Make the API call
      const newReview = await apiClient.post<Review>('/reviews/', payload)

      // Call the onSubmit prop passed from the parent with the successful API response
      onSubmit(newReview)

    } catch (err: any) {
      console.error("Failed to submit review:", err)
       // Handle API errors
       let errorMessage = "Failed to submit review. Please try again.";
        if (err.response && err.response.data) {
            const errors = err.response.data;
             // Try to format DRF validation errors
             const messages = Object.entries(errors)
               .map(([field, fieldMessages]) => `${field}: ${Array.isArray(fieldMessages) ? fieldMessages.join(', ') : fieldMessages}`)
               .join(' | ');
            if (messages) errorMessage = messages;
            else if (errors.detail) errorMessage = errors.detail; // Handle non_field_errors
        } else if (err.message) {
            errorMessage = err.message;
        }
      setApiError(errorMessage) // Set API error state to display
    } finally {
      setIsSubmitting(false) // Stop loading
    }
  }

  // Keep handleVerifiedFeatureChange, but use renamed state
  const handleVerifiedFeatureChange = (featureId: number, checked: boolean | 'indeterminate') => {
    const isChecked = checked === true;
    setClientErrors({}); // Clear validation errors on change
    setApiError(null); // Clear API errors on change
    if (isChecked) {
      setVerifiedFeatureIds([...verifiedFeatureIds, featureId])
      setMissingFeatureIds(missingFeatureIds.filter((id) => id !== featureId))
    } else {
      setVerifiedFeatureIds(verifiedFeatureIds.filter((id) => id !== featureId))
    }
  }

  // Keep handleMissingFeatureChange, but use renamed state
  const handleMissingFeatureChange = (featureId: number, checked: boolean | 'indeterminate') => {
     const isChecked = checked === true;
    setClientErrors({}); // Clear validation errors on change
    setApiError(null); // Clear API errors on change
    if (isChecked) {
      setMissingFeatureIds([...missingFeatureIds, featureId])
      setVerifiedFeatureIds(verifiedFeatureIds.filter((id) => id !== featureId))
    } else {
      setMissingFeatureIds(missingFeatureIds.filter((id) => id !== featureId))
    }
  }

  // Helper component for star rendering (copied from your original code)
    const StarRatingInput: React.FC<{
      count: number;
      value: number;
      onChange: (value: number) => void;
      colorClass: string; // e.g., "text-yellow-500"
      label: string;
      required?: boolean;
      error?: string;
      disabled?: boolean;
    }> = ({ count, value, onChange, colorClass, label, required, error, disabled }) => (
      <div className="space-y-2">
        <Label htmlFor={label.toLowerCase().replace(' ','-')} className="text-base">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="flex gap-1">
          {[...Array(count)].map((_, index) => {
            const starValue = index + 1;
            return (
              <button
                key={starValue}
                type="button"
                className={`p-1 rounded ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => !disabled && onChange(starValue)}
                disabled={disabled}
                aria-label={`Rate ${starValue} out of ${count} stars`}
              >
                <Star
                   className={`h-8 w-8 transition-colors ${
                     starValue <= value ? `${colorClass} fill-current` : "text-gray-300 dark:text-gray-600"
                   } ${!disabled && starValue > value ? `hover:text-gray-400 dark:hover:text-gray-500` : ''}`}
                />
              </button>
            );
          })}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       {/* Display API Error */}
       {apiError && (
         <Alert variant="destructive">
           <AlertCircle className="h-4 w-4" />
           <AlertDescription>{apiError.split('|').map((e, i) => <div key={i}>{e.trim()}</div>)}</AlertDescription>
         </Alert>
       )}

      {/* Overall Rating - Use helper component */}
       <StarRatingInput
           count={5}
           value={rating}
           onChange={setRating}
           colorClass="text-yellow-500"
           label="Overall Rating"
           required={true}
           error={clientErrors.rating}
           disabled={isSubmitting}
        />

      {/* Accessibility Rating - Use helper component */}
      <StarRatingInput
           count={5}
           value={accessibilityRating}
           onChange={setAccessibilityRating}
           colorClass="text-green-500"
           label="Accessibility Rating"
           required={false} // Marked optional based on schema
           error={clientErrors.accessibilityRating}
           disabled={isSubmitting}
        />


      {/* Comment - Kept mostly as is */}
      <div className="space-y-2">
        <Label htmlFor="comment" className="text-base">
          Your Review {/* Removed required star as it's optional */}
        </Label>
        <Textarea
          id="comment"
          placeholder="Share your experience with this place (optional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          disabled={isSubmitting} // Disable while submitting
        />
        {clientErrors.comment && <p className="text-sm text-red-500">{clientErrors.comment}</p>}
      </div>

      {/* Accessibility Features Verification - Kept mostly as is */}
      {accessibilityFeatures.length > 0 && ( // Only show if features exist for the place
            <div className="space-y-4 rounded-md border dark:border-gray-700 p-4">
                <div>
                <h3 className="text-base font-medium mb-2">Verify Accessibility Features (Optional)</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Help others by verifying which accessibility features are present and which ones are missing or inadequate.
                </p>
                </div>

                {clientErrors.features && <p className="text-sm text-red-500">{clientErrors.features}</p>}

                <div className="grid gap-6 md:grid-cols-2">
                {/* Verified Features */}
                <div className="space-y-3">
                    <div className="flex items-center text-green-600 dark:text-green-400">
                    <Check className="h-5 w-5 mr-2" />
                    <h4 className="font-medium">Present / Adequate</h4>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {accessibilityFeatures.map((feature) => (
                        <div key={`verified-${feature.id}`} className="flex items-start space-x-2">
                        <Checkbox
                            id={`verified-${feature.id}`}
                            checked={verifiedFeatureIds.includes(feature.id)}
                            onCheckedChange={(checked) => handleVerifiedFeatureChange(feature.id, checked)}
                            disabled={isSubmitting} // Disable while submitting
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label
                            htmlFor={`verified-${feature.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                            {feature.name}
                            </Label>
                            <p className="text-xs text-muted-foreground">{feature.description ?? <span className="italic">No details.</span>}</p>
                        </div>
                        </div>
                    ))}
                    </div>
                </div>

                {/* Missing Features */}
                <div className="space-y-3">
                    <div className="flex items-center text-red-600 dark:text-red-400">
                    <X className="h-5 w-5 mr-2" />
                    <h4 className="font-medium">Missing / Inadequate</h4>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {accessibilityFeatures.map((feature) => (
                        <div key={`missing-${feature.id}`} className="flex items-start space-x-2">
                        <Checkbox
                            id={`missing-${feature.id}`}
                            checked={missingFeatureIds.includes(feature.id)}
                            onCheckedChange={(checked) => handleMissingFeatureChange(feature.id, checked)}
                            className="border-red-300 data-[state=checked]:bg-red-600 data-[state=checked]:text-primary-foreground dark:border-red-700" // Styling distinction
                            disabled={isSubmitting} // Disable while submitting
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label
                            htmlFor={`missing-${feature.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                            {feature.name}
                            </Label>
                            <p className="text-xs text-muted-foreground">{feature.description ?? <span className="italic">No details.</span>}</p>
                        </div>
                        </div>
                    ))}
                    </div>
                </div>
                </div>
            </div>
       )}

      {/* Buttons - Kept as is, added loading state */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
      </div>
    </form>
  )
}