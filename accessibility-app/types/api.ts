// types/api.ts (Create this file)
export interface AccessibilityFeature {
    id: number;
    name: string;
    description: string | null;
}

export interface UserSummary { // For nested user data
    id: number;
    username: string;
    first_name?: string; // May not always be present depending on serializer context
    last_name?: string;
}

export interface UserProfile {
  id: number;
  user_type: 'seeker' | 'provider' | 'admin';
  accessibility_needs: AccessibilityFeature[];
  // We use needs_ids for writing, not typically reading
}

 export interface User extends UserSummary { // Full user details (from /auth/me/)
    email: string;
    first_name: string;
    last_name: string;
    profile?: UserProfile; // Profile might be nested sometimes
    user_type?: 'seeker' | 'provider' | 'admin'; // Add from profile fetch
 }


export interface Place {
    id: number;
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    place_type: string;
    description: string | null;
    website: string | null;
    phone_number: string | null;
    accessibility_features: AccessibilityFeature[];
    owner: UserSummary | null; // Owner can be null
    created_at: string;
    updated_at: string;
    review_count: number;
    // feature_ids is write-only
}

export interface Review {
    id: number;
    place: number; // ID on read/write
    place_name?: string; // Read-only from serializer
    user: UserSummary; // Read-only user details
    rating: number;
    accessibility_rating: number | null;
    comment: string | null;
    accessibility_verification: 'verified' | 'inaccurate' | 'partial' | 'unverified';
    verified_features: AccessibilityFeature[]; // Read-only
    missing_features: AccessibilityFeature[]; // Read-only
    // verified_feature_ids is write-only
    // missing_feature_ids is write-only
    created_at: string;
    updated_at: string;
}