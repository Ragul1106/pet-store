from rest_framework import serializers
from .models import PetCategory, PetProduct, PetBanner

class ImageURLField(serializers.ImageField):
    def to_representation(self, value):
        rep = super().to_representation(value)
        request = self.context.get("request")
        if rep and request is not None and not rep.startswith("http"):
            rep = request.build_absolute_uri(rep)
        return rep


class PetCategorySerializer(serializers.ModelSerializer):
    image = ImageURLField(required=False, allow_null=True)

    class Meta:
        model = PetCategory
        fields = ["id", "title", "subtitle", "image", "group", "order", "pet_type"]


class PetProductSerializer(serializers.ModelSerializer):
    image = ImageURLField()
    quantity_display = serializers.ReadOnlyField()

    class Meta:
        model = PetProduct
        fields = [
            "id", "title", "image", "price",
            "quantity_value", "quantity_unit", "quantity_display",
            "rating", "rating_count",
        ]


class PetBannerSerializer(serializers.ModelSerializer):
    left_image = ImageURLField(required=False, allow_null=True)
    right_image = ImageURLField(required=False, allow_null=True)

    class Meta:
        model = PetBanner
        fields = ["pet_type", "title", "subtitle", "left_image", "right_image"]
