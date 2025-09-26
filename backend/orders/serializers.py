# orders/serializers.py
from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "product_id", "product_title", "product_image", "price", "quantity"]

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "token", "status", "created",
            "billing_name", "billing_email", "billing_phone",
            "billing_address_line1", "billing_address_line2",
            "billing_city", "billing_state", "billing_pincode",
            "subtotal", "shipping", "total", "notes", "items",
        ]
        read_only_fields = ["id", "token", "status", "created", "subtotal", "shipping", "total", "items"]


# from rest_framework import serializers
# from .models import Order

# class OrderSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Order
#         fields = "__all__"
#         read_only_fields = ["id", "status", "created"]
