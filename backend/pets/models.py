from django.db import models

class TimeStamped(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class PetType(models.TextChoices):
    DOG = "dog", "Dog"
    CAT = "cat", "Cat"
    SMALL = "small-pets", "Small pets"


class UnitType(models.TextChoices):
    KG = "kg", "Kilogram"
    G = "g", "Gram"
    ML = "ml", "Millilitre"
    L = "l", "Litre"
    PCS = "pcs", "Pieces"
    INCH = "inch", "Inch"
    PACK = "pack", "Pack"
    OTHER = "other", "Other"


class PetCategory(TimeStamped):
    pet_type = models.CharField(max_length=20, choices=PetType.choices, default=PetType.DOG)
    title = models.CharField(max_length=120)
    subtitle = models.CharField(max_length=160, blank=True)
    image = models.ImageField(upload_to="pet_categories/", blank=True, null=True)
    group = models.CharField(max_length=80, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.get_pet_type_display()} - {self.title}"


class PetProduct(TimeStamped):
    pet_type = models.CharField(max_length=20, choices=PetType.choices, default=PetType.DOG)
    title = models.CharField(max_length=220)
    brand = models.CharField(max_length=120, blank=True, null=True)
    image = models.ImageField(upload_to="pet_products/", blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)

    # Quantity as value + unit
    quantity_value = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    quantity_unit = models.CharField(max_length=20, choices=UnitType.choices, default=UnitType.PCS)

    mrp = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    # rating summary
    rating = models.PositiveIntegerField(choices=[(i, str(i)) for i in range(1, 6)], default=5)
    rating_count = models.PositiveIntegerField(default=0)

    # related products
    related = models.ManyToManyField("self", blank=True)

    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "-created"]

    @property
    def quantity_display(self):
        return f"{self.quantity_value} {self.quantity_unit}"

    def __str__(self):
        return f"{self.title} ({self.get_pet_type_display()})"


class ProductReview(TimeStamped):
    product = models.ForeignKey(PetProduct, on_delete=models.CASCADE, related_name="reviews")
    name = models.CharField(max_length=120)
    email = models.EmailField()
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)], default=5)
    review = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} — {self.product.title}"


class PetBanner(TimeStamped):
    pet_type = models.CharField(max_length=20, choices=PetType.choices, unique=True)
    title = models.CharField(max_length=160)
    subtitle = models.TextField(blank=True)
    left_image = models.ImageField(upload_to="pet_banners/", blank=True, null=True)
    right_image = models.ImageField(upload_to="pet_banners/", blank=True, null=True)

    def __str__(self):
        return f"{self.get_pet_type_display()} Banner"


# from django.db import models
# class TimeStamped(models.Model):
#     created = models.DateTimeField(auto_now_add=True)
#     updated = models.DateTimeField(auto_now=True)
#     class Meta:
#         abstract = True

# class PetType(models.TextChoices):
#     DOG = "dog", "Dog"
#     CAT = "cat", "Cat"
#     SMALL = "small-pets", "Small pets"

# class PetCategory(TimeStamped):
#     """
#     Used for left-side promo cards and/or sidebar lists.
#     Add 'group' to cluster into blocks (e.g., 'Top Deals', 'Toys', etc.) if desired.
#     """
#     pet_type = models.CharField(max_length=20, choices=PetType.choices, default=PetType.DOG)
#     title = models.CharField(max_length=120)
#     subtitle = models.CharField(max_length=160, blank=True)
#     image = models.ImageField(upload_to="pet_categories/", blank=True, null=True)
#     group = models.CharField(max_length=80, blank=True)  # optional block heading
#     order = models.PositiveIntegerField(default=0)

#     class Meta:
#         ordering = ["order", "id"]

#     def __str__(self):
#         return f"{self.get_pet_type_display()} - {self.title}"

# class UnitType(models.TextChoices):
#     KG = "kg", "Kilogram"
#     G = "g", "Gram"
#     ML = "ml", "Millilitre"
#     L = "l", "Litre"
#     PCS = "pcs", "Pieces"
#     INCH = "inch", "Inch"
#     PACK = "pack", "Pack"
#     OTHER = "other", "Other"

# class PetProduct(TimeStamped):
#     pet_type = models.CharField(max_length=20, choices=PetType.choices, default=PetType.DOG)
#     title = models.CharField(max_length=220)
#     image = models.ImageField(upload_to="pet_products/")
#     price = models.DecimalField(max_digits=10, decimal_places=2)

#     quantity_value = models.DecimalField(max_digits=10, decimal_places=2, default=1)
#     quantity_unit = models.CharField(max_length=20, choices=UnitType.choices, default=UnitType.PCS)

#     rating = models.PositiveIntegerField(
#         choices=[(i, str(i)) for i in range(1, 6)], default=5
#     )
#     rating_count = models.PositiveIntegerField(default=0)
#     is_active = models.BooleanField(default=True)
#     order = models.PositiveIntegerField(default=0)

#     class Meta:
#         ordering = ["order", "-created"]

#     def __str__(self):
#         return f"{self.title} ({self.quantity_value}{self.quantity_unit})"

#     @property
#     def quantity_display(self):
#         return f"{self.quantity_value} {self.quantity_unit}"


#     def __str__(self):
#         return f"{self.title} ({self.get_pet_type_display()})"

# class PetBanner(TimeStamped):
#     pet_type = models.CharField(max_length=20, choices=PetType.choices, unique=True)
#     title = models.CharField(max_length=160)
#     subtitle = models.TextField(blank=True)
#     left_image = models.ImageField(upload_to="pet_banners/", blank=True, null=True)
#     right_image = models.ImageField(upload_to="pet_banners/", blank=True, null=True)

#     def __str__(self):
#         return f"{self.get_pet_type_display()} Banner"

