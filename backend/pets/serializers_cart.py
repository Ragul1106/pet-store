# petshop/serializers_cart.py
from rest_framework import serializers
from .models_cart import Cart, CartItem
from .models import PetProduct
from .serializers import PetProductSerializer  # reuse product serializer

class CartItemSerializer(serializers.ModelSerializer):
    product = PetProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=PetProduct.objects.all(),
        source="product",
        write_only=True
    )

    class Meta:
        model = CartItem
        fields = ["id", "product", "product_id", "quantity", "price_snapshot", "subtotal"]
        read_only_fields = ["price_snapshot", "subtotal"]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    item_count = serializers.IntegerField(read_only=True)
    token = serializers.CharField(read_only=True)

    class Meta:
        model = Cart
        fields = ["token", "items", "subtotal", "item_count"]
