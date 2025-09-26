from django.db import models
from decimal import Decimal

class BookingService(models.Model):
    """
    Single row model to manage content for the Consult Now / Booking page.
    Admin uploads images and edits text here.
    """
    # page banner
    banner = models.ImageField(upload_to="booking/banner/")

    # Top green feature strip (three short texts)
    feature_1 = models.CharField(max_length=120, blank=True, default="Pay & book the consultant")
    feature_2 = models.CharField(max_length=120, blank=True, default="Choose video or Teleconsultation")
    feature_3 = models.CharField(max_length=120, blank=True, default="Receive prescription after the call")

    # overlay box on banner (left)
    overlay_title = models.CharField(max_length=255, blank=True, default="Instant and complete vet care")
    overlay_text = models.TextField(blank=True, default="Wherever you are. At only 299, get end-to-end support from our vets.")
    overlay_cta_text = models.CharField(max_length=100, blank=True, default="Consult Now")

    # booking / price card data
    price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("299.00"))
    mrp = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("499.00"))
    discount_text = models.CharField(max_length=100, blank=True, default="40% OFF")

    # offers / small info lines
    offers_text = models.CharField(max_length=255, blank=True, default="Bank offers and coupons")
    offers_button_text = models.CharField(max_length=80, blank=True, default="Check offers")
    cod_info = models.CharField(max_length=255, blank=True, default="Currently, cash on delivery is not available on this product.")
    delivery_info = models.CharField(max_length=255, blank=True, default="Free delivery on orders above ₹599")

    # Add to cart button text & small rating
    add_to_cart_text = models.CharField(max_length=80, blank=True, default="Add to cart")
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=Decimal("5.0"))

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"BookingService #{self.pk} ({self.created_at:%Y-%m-%d %H:%M})"

#--------------
class ConsultPage(models.Model):
    """
    Single table for all consult page content:
    - banner: main banner image (full width)
    - overlay_title / overlay_text / overlay_cta_text: black overlay on banner (left)
    - cta_top_image: image that overlaps the green CTA band
    - cta_text / cta_button_text: green CTA band content
    """
    banner = models.ImageField(upload_to="consult/banner/")
    overlay_title = models.CharField(max_length=255, blank=True)
    overlay_text = models.TextField(blank=True)
    overlay_cta_text = models.CharField(max_length=100, default="Consult Now", blank=True)

    # CTA block
    cta_top_image = models.ImageField(upload_to="consult/cta_top/", blank=True, null=True)
    cta_text = models.CharField(max_length=255, blank=True)
    cta_button_text = models.CharField(max_length=100, default="Consult Now", blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"ConsultPage #{self.pk} ({self.created_at:%Y-%m-%d %H:%M})"

class VetDoctor(models.Model):
    name = models.CharField(max_length=200)
    short_title = models.CharField(max_length=200, blank=True)
    photo = models.ImageField(upload_to="consult/doctors/")
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.name
#------------

class PetServicesPage(models.Model):
    """
    Single landing page content. We will return the latest instance from API.
    Admin editors upload images and edit text.
    """
    # Top intro
    title = models.CharField(max_length=200, default="Pet Services")
    intro_text = models.TextField(blank=True)

    # Top right customer support
    customer_service_title = models.CharField(max_length=80, default="customer service")
    customer_phone = models.CharField(max_length=40, blank=True)

    # Second row: left area contains a left promo box and a center image
    promo_left_title = models.CharField(max_length=120, blank=True)
    promo_left_subtitle = models.TextField(blank=True)
    promo_left_button = models.CharField(max_length=40, blank=True)

    center_image = models.ImageField(upload_to="petservices/center/", null=True, blank=True)

    # Right side of second row (60:40 outer split -> right green box)
    promo_right_title = models.CharField(max_length=120, blank=True)
    promo_right_text = models.TextField(blank=True)
    promo_right_button = models.CharField(max_length=40, blank=True)

    # ordering/time
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"PetServicesPage #{self.pk} ({self.title})"


class ServiceCard(models.Model):
    """
    Individual card shown in the third row.
    """
    page = models.ForeignKey(PetServicesPage, on_delete=models.CASCADE, related_name="cards")
    title = models.CharField(max_length=200, blank=True)
    content = models.TextField(blank=True)
    button_text = models.CharField(max_length=60, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"Card {self.order}: {self.title[:30]}"


class PetServiceLanding(models.Model):
    left_banner = models.ImageField(upload_to="petservices/banner_left/", null=True, blank=True)
    right_banner = models.ImageField(upload_to="petservices/banner_right/", null=True, blank=True)
    logo = models.ImageField(upload_to="petservices/logo/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
