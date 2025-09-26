from django.db import models
from django.utils.text import slugify

class CarousalBanner3(models.Model):
    """
    Carousel banner 3 model for the promo with left green area and right product image.
    Fields returned by serializer (frontend expects *_url names):
      - left_image_1, left_image_2, right_image
      - diamond_text, save_text
      - button_text, button_link
      - bg_color (optional)
      - order, active
    """
    left_image_1 = models.ImageField(upload_to="banners/carousal3/left/", blank=True, null=True)
    left_image_2 = models.ImageField(upload_to="banners/carousal3/left/", blank=True, null=True)
    right_image = models.ImageField(upload_to="banners/carousal3/right/", blank=True, null=True)

    diamond_text = models.CharField(max_length=255, blank=True, help_text="Text shown in the diamond price tag (can include newline)")
    save_text = models.CharField(max_length=128, blank=True, help_text="Small save pill text")
    button_text = models.CharField(max_length=128, blank=True)
    button_link = models.CharField(max_length=512, blank=True)
    bg_color = models.CharField(max_length=20, blank=True, default="#98FB98", help_text="Optional hex color for left background")

    order = models.PositiveSmallIntegerField(default=0)
    active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Carousel Banner 3"
        verbose_name_plural = "Carousel Banner 3"
        ordering = ("order", "-created_at")

    def __str__(self):
        return f"CarousalBanner3 #{self.pk} ({self.button_text or 'banner'})"


class CarousalBanner2(models.Model):
    """
    Banner used by the second promo/hero on the homepage.
    Fields match what the frontend expects:
      - left_image_url -> left_image (ImageField)
      - right_image_url -> right_image (ImageField)
      - ribbon_text -> short blue ribbon text
      - overlay_title -> big overlay heading (can include newlines)
      - overlay_body -> smaller overlay body lines (can include newlines)
      - button_text -> CTA text
      - button_link -> CTA URL (internal or absolute)
    """
    left_image = models.ImageField(upload_to="banners/carousal2/left/", blank=True, null=True)
    right_image = models.ImageField(upload_to="banners/carousal2/right/", blank=True, null=True)

    ribbon_text = models.CharField(max_length=255, blank=True)
    overlay_title = models.TextField(blank=True)
    overlay_body = models.TextField(blank=True)

    button_text = models.CharField(max_length=128, blank=True)
    button_link = models.CharField(max_length=500, blank=True)

    order = models.PositiveSmallIntegerField(default=0, help_text="Display order (lower first)")
    active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Carousel Banner 2"
        verbose_name_plural = "Carousel Banner 2"
        ordering = ("order", "-created_at")

    def __str__(self):
        return f"CarousalBanner2 #{self.pk} ({self.ribbon_text[:40]})"


class CarousalBanner1(models.Model):
    class Meta:
        db_table = "carousal_banner1"
        verbose_name = "Carousal Banner"
        verbose_name_plural = "Carousal Banners"

    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True, null=True)
    button_text = models.CharField(max_length=100, default="Shop Now")
    link = models.URLField(blank=True, null=True, help_text="Full URL or relative path")

    # Media
    image = models.ImageField(upload_to="banners/", help_text="Left side image")
    right_image = models.ImageField(upload_to="banners/", blank=True, null=True,
                                    help_text="Right side illustration (e.g. umbrella)")

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title



class PetService(models.Model):
    title = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    short_description = models.TextField(blank=True)
    promo_text = models.CharField(max_length=160, blank=True, help_text="Short promo shown below the card")
    image = models.ImageField(upload_to="pet_services/")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("order",)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)[:140]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class OfferStrip(models.Model):
    title = models.CharField(max_length=255)
    subtitle = models.TextField(blank=True)
    product_image = models.ImageField(upload_to="offer_strip/")
    button_text = models.CharField(max_length=64, default="Shop Now")
    link = models.CharField(max_length=255, blank=True, help_text="Internal path or external URL")
    background_color = models.CharField(max_length=20, default="#9fffae")
    text_color = models.CharField(max_length=20, default="#000000")
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ("order",)


class PromoBanner(models.Model):
    title = models.CharField(max_length=255)
    subtitle = models.TextField(blank=True)
    button_text = models.CharField(max_length=50, default="Shop & Save")
    discount_text = models.CharField(max_length=50, default="Save 35%")
    image = models.ImageField(upload_to="promo_banners/")
    link = models.CharField(
        max_length=255,
        blank=True,
        help_text="Enter a relative path like /category/dog or a full URL like https://example.com"
    )

    def __str__(self):
        return self.title



class HomeCategory(models.Model):
    title = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    image = models.ImageField(upload_to='homecategories/')
    description = models.TextField(blank=True)

    def __str__(self):
        return self.title
