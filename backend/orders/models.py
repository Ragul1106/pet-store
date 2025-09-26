# orders/models.py
import uuid
from django.conf import settings
from django.db import models

class TimeStamped(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True

class Order(TimeStamped):
    ORDER_STATUS = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="orders")
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default="pending")

    # Billing / contact
    # orders/models.py (Order model)
    billing_name = models.CharField(max_length=200, blank=True, default='')
    billing_email = models.EmailField(blank=True, default='')
    billing_phone = models.CharField(max_length=40, blank=True, default='')
    billing_address_line1 = models.CharField(max_length=255, blank=True, default='')
    billing_address_line2 = models.CharField(max_length=255, blank=True, default='')
    billing_city = models.CharField(max_length=120, blank=True, default='')
    billing_state = models.CharField(max_length=120, blank=True, default='')
    billing_pincode = models.CharField(max_length=20, blank=True, default='')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Order {self.id} ({self.token})"

class OrderItem(TimeStamped):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product_id = models.IntegerField()  # snapshot of PetProduct id
    product_title = models.CharField(max_length=255)
    product_image = models.CharField(max_length=1024, blank=True)  # store absolute URL or path
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)

    def subtotal(self):
        return self.quantity * self.price

    def __str__(self):
        return f"{self.product_title} x{self.quantity}"


# from django.db import models
# from django.conf import settings
# import uuid
# from pets.models_cart import Cart

# class Order(models.Model):
#     STATUS_CHOICES = [
#         ("pending", "Pending"),
#         ("paid", "Paid"),
#         ("shipped", "Shipped"),
#         ("delivered", "Delivered"),
#     ]

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
#     cart = models.OneToOneField(Cart, on_delete=models.PROTECT)
#     email = models.EmailField()
#     first_name = models.CharField(max_length=100)
#     last_name = models.CharField(max_length=100)
#     address = models.TextField()
#     apartment = models.CharField(max_length=200, blank=True)
#     city = models.CharField(max_length=100)
#     state = models.CharField(max_length=100)
#     pincode = models.CharField(max_length=20)
#     phone = models.CharField(max_length=20)
#     payment_method = models.CharField(max_length=20, choices=[("online", "Online"), ("cod", "Cash on Delivery")])
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
#     total = models.DecimalField(max_digits=10, decimal_places=2)
#     created = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Order {self.id} - {self.first_name} {self.last_name}"
    
    