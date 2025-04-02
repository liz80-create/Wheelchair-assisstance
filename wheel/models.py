from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

class AccessibilityFeature(models.Model):
    """Represents a specific accessibility feature (e.g., Ramp, Accessible Toilet)."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    # Add category later if needed (e.g., Mobility, Sensory)
    # category = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']

class Place(models.Model):
    """Represents a place like a restaurant, cafe, shop."""
    PLACE_TYPES = (
        ('restaurant', 'Restaurant'),
        ('cafe', 'Cafe'),
        ('shop', 'Shop'),
        ('venue', 'Venue'),
        ('other', 'Other'),
    )

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='owned_places', on_delete=models.SET_NULL, null=True, blank=True) # User who registered/manages
    name = models.CharField(max_length=200)
    address = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    place_type = models.CharField(max_length=50, choices=PLACE_TYPES)
    description = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Link to accessibility features offered by this place
    accessibility_features = models.ManyToManyField(
        AccessibilityFeature,
        blank=True,
        related_name='places'
    )

    # Potentially add an overall accessibility score or verification status later
    # is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class UserProfile(models.Model):
    """Extends Django's User model to add accessibility needs and user type."""
    USER_TYPES = (
        ('seeker', 'Accessibility Seeker'), # e.g., wheelchair user
        ('provider', 'Information Provider'), # e.g., place owner/manager
        ('admin', 'Administrator'),
    )
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='seeker')

    # Link to accessibility features needed by this user (if 'seeker')
    accessibility_needs = models.ManyToManyField(
        AccessibilityFeature,
        blank=True,
        related_name='users_needing'
    )

    def __str__(self):
        return f"{self.user.username}'s Profile ({self.get_user_type_display()})"

# Signal to create/update UserProfile when User is created/updated
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    instance.profile.save()


class Review(models.Model):
    """Allows users to review places, focusing on accessibility verification."""
    VERIFICATION_CHOICES = (
        ('verified', 'Verified Accurate'),
        ('inaccurate', 'Information Inaccurate'),
        ('partial', 'Partially Accurate'),
        ('unverified', 'Not Yet Verified'),
    )

    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)]) # e.g., 1-5 stars for overall experience
    accessibility_rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)], null=True, blank=True) # Optional: Specific rating for accessibility
    comment = models.TextField(blank=True, null=True)
    # Focus on verification
    accessibility_verification = models.CharField(max_length=20, choices=VERIFICATION_CHOICES, default='unverified')
    verified_features = models.ManyToManyField(AccessibilityFeature, blank=True, related_name='verified_in_reviews') # Features confirmed present
    missing_features = models.ManyToManyField(AccessibilityFeature, blank=True, related_name='missing_in_reviews') # Features claimed but missing

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        # Ensure a user reviews a place only once? Or allow multiple updates? Allow multiple for now.
        # unique_together = ('place', 'user')

    def __str__(self):
        return f"Review for {self.place.name} by {self.user.username}"