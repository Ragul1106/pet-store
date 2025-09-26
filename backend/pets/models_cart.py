import uuid
from django.conf import settings
from django.db import models
from .models import TimeStamped, PetProduct  

class Cart(TimeStamped):
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="carts"
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Cart {self.token}"

    @property
    def subtotal(self):
        return sum(item.subtotal for item in self.items.all())

    @property
    def item_count(self):
        return sum(item.quantity for item in self.items.all())


class CartItem(TimeStamped):
    cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(PetProduct, related_name="cart_items", on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price_snapshot = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ("cart", "product")

    def __str__(self):
        return f"{self.product.title} x{self.quantity}"

    @property
    def subtotal(self):
        return self.quantity * self.price_snapshot
