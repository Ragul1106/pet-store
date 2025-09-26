# petshop/serializers_detail.py
from rest_framework import serializers
from .models import PetProduct, ProductReview
from .serializers import ImageURLField, PetProductSerializer


class ProductReviewSerializer(serializers.ModelSerializer):
    created = serializers.DateTimeField(read_only=True)

    class Meta:
        model = ProductReview
        fields = ["id", "name", "email", "rating", "review", "created"]


class PetProductDetailSerializer(serializers.ModelSerializer):
    image = ImageURLField(required=False, allow_null=True)
    quantity_display = serializers.ReadOnlyField()
    related_products = PetProductSerializer(source="related", many=True, read_only=True)
    reviews = ProductReviewSerializer(many=True, read_only=True)

    class Meta:
        model = PetProduct
        fields = [
            "id", "pet_type", "title", "brand", "image", "description",
            "price", "mrp", "quantity_value", "quantity_unit", "quantity_display",
            "rating", "rating_count", "related_products", "reviews",
        ]
