from rest_framework import serializers
from django.contrib.auth.models import User
from .models import AccessibilityFeature, Place, UserProfile, Review
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile
# --- Feature Serializer ---
class AccessibilityFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccessibilityFeature
        fields = ['id', 'name', 'description']

# --- User & Profile Serializers ---
class UserProfileSerializer(serializers.ModelSerializer):
    # Make needs writeable using PrimaryKeyRelatedField
    accessibility_needs = AccessibilityFeatureSerializer(many=True, read_only=True)
    # For writing needs, allow sending a list of IDs
    needs_ids = serializers.PrimaryKeyRelatedField(
        queryset=AccessibilityFeature.objects.all(),
        source='accessibility_needs',
        many=True,
        write_only=True,
        required=False # Allow clearing needs
    )

    class Meta:
        model = UserProfile
        fields = ['id', 'user_type', 'accessibility_needs', 'needs_ids']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True) # Read related profile

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']
        # Add 'password' for registration, handled in view
        # extra_kwargs = {'password': {'write_only': True}} # Handled in specific registration view

# wheel/serializers.py (or api/serializers.py)
from rest_framework import serializers
from django.contrib.auth.models import User
# Make sure UserProfile is imported if needed by other serializers,
# or directly using its choices like below is fine too.
from .models import UserProfile

class RegisterSerializer(serializers.Serializer):
    # Explicitly declare ALL fields we expect from the frontend
    username = serializers.CharField(required=True, max_length=150)
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=True, max_length=150)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm Password", style={'input_type': 'password'})
    user_type = serializers.ChoiceField(choices=UserProfile.USER_TYPES, required=True)
    def to_representation(self, instance):
        # Return the user representation without attempting to access user_type directly
        ret = {
            'id': instance.id,
            'username': instance.username,
            'email': instance.email,
            'first_name': instance.first_name,
            'last_name': instance.last_name,
        }
        
        # Only add profile data if it exists
        if hasattr(instance, 'profile'):
            ret['user_type'] = instance.profile.user_type
        
        return ret
    # No Meta class needed when inheriting from serializers.Serializer

    # --- Custom Validation ---
    def validate_email(self, value):
        """Check that the email is unique."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

    def validate_username(self, value):
        """Check that the username is unique."""
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        # Add other username validation if desired
        return value

    def validate_password(self, value):
        """Apply Django's built-in password validators."""
        try:
            validate_password(value) # Use Django's password validation
        except serializers.ValidationError as exc:
            raise serializers.ValidationError(str(exc))
        return value

    def validate(self, attrs):
        """Check that the two password entries match."""
        if attrs['password'] != attrs['password2']:
            # Raise validation error specifically on password2 for better frontend handling
            raise serializers.ValidationError({"password2": "Password fields didn't match."})
        return attrs

    # --- Object Creation ---
    def create(self, validated_data):
        """Create and return a new user, setting the password and profile type correctly."""
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            # IMPORTANT: Use the validated password from attrs, not password2!
            password=validated_data['password']
        )

        # Set profile type (profile should be created via signal)
        if validated_data.get('user_type') and hasattr(user, 'profile'):
            user.profile.user_type = validated_data['user_type']
            user.profile.save() # Explicitly save profile with type

        return user

    # We don't need an update method for registration


# --- Place Serializers ---
class PlaceSerializer(serializers.ModelSerializer):
    # Show feature details when reading, accept IDs when writing
    accessibility_features = AccessibilityFeatureSerializer(many=True, read_only=True)
    feature_ids = serializers.PrimaryKeyRelatedField(
        queryset=AccessibilityFeature.objects.all(),
        source='accessibility_features',
        many=True,
        write_only=True,
        required=False # Allow places with no features initially
    )
    owner = UserSerializer(read_only=True) # Show owner details (read-only)
    # You might want a simpler owner representation sometimes:
    # owner_username = serializers.CharField(source='owner.username', read_only=True)
    review_count = serializers.IntegerField(source='reviews.count', read_only=True)
    # Add average rating later if needed

    class Meta:
        model = Place
        fields = [
            'id', 'name', 'address', 'latitude', 'longitude', 'place_type',
            'description', 'website', 'phone_number', 'owner', 'created_at',
            'updated_at', 'accessibility_features', 'feature_ids', 'review_count'
        ]
        read_only_fields = ['owner', 'created_at', 'updated_at', 'review_count'] # Owner set implicitly

# --- Review Serializers ---
class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True) # Show user details
    place_name = serializers.CharField(source='place.name', read_only=True)
    # Allow writing related features by ID
    verified_feature_ids = serializers.PrimaryKeyRelatedField(
        queryset=AccessibilityFeature.objects.all(), source='verified_features', many=True, write_only=True, required=False
    )
    missing_feature_ids = serializers.PrimaryKeyRelatedField(
        queryset=AccessibilityFeature.objects.all(), source='missing_features', many=True, write_only=True, required=False
    )
    # Show features details on read
    verified_features = AccessibilityFeatureSerializer(many=True, read_only=True)
    missing_features = AccessibilityFeatureSerializer(many=True, read_only=True)


    class Meta:
        model = Review
        fields = [
            'id', 'place', 'place_name', 'user', 'rating', 'accessibility_rating', 'comment',
            'accessibility_verification', 'verified_features', 'missing_features',
            'verified_feature_ids', 'missing_feature_ids', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at', 'place_name']
        # Make 'place' writeable only on create, not update? Often handled via nested URL.
        extra_kwargs = {
            'place': {'write_only': True} # Send place ID when creating review
        }