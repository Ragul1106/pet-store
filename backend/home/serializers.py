from rest_framework import serializers
from .models import HomeCategory
from .models import PromoBanner
from .models import OfferStrip
from .models import PetService
from .models import CarousalBanner1
from .models import CarousalBanner2
from .models import CarousalBanner3


class CarousalBanner3Serializer(serializers.ModelSerializer):
    left_image_1_url = serializers.SerializerMethodField()
    left_image_2_url = serializers.SerializerMethodField()
    right_image_url = serializers.SerializerMethodField()

    class Meta:
        model = CarousalBanner3
        fields = [
            "id",
            "left_image_1_url",
            "left_image_2_url",
            "right_image_url",
            "diamond_text",
            "save_text",
            "button_text",
            "button_link",
            "bg_color",
            "order",
            "active",
            "created_at",
            "updated_at",
        ]

    def _build_url(self, img_field):
        request = self.context.get("request")
        if not img_field:
            return ""
        try:
            url = img_field.url
        except Exception:
            return ""
        return request.build_absolute_uri(url) if request else url

    def get_left_image_1_url(self, obj):
        return self._build_url(obj.left_image_1)

    def get_left_image_2_url(self, obj):
        return self._build_url(obj.left_image_2)

    def get_right_image_url(self, obj):
        return self._build_url(obj.right_image)


class CarousalBanner2Serializer(serializers.ModelSerializer):
    left_image_url = serializers.SerializerMethodField()
    right_image_url = serializers.SerializerMethodField()

    class Meta:
        model = CarousalBanner2
        fields = [
            "id",
            "left_image_url",
            "right_image_url",
            "ribbon_text",
            "overlay_title",
            "overlay_body",
            "button_text",
            "button_link",
            "order",
            "active",
            "created_at",
            "updated_at",
        ]

    def get_left_image_url(self, obj):
        request = self.context.get("request")
        if obj.left_image and hasattr(obj.left_image, "url"):
            return request.build_absolute_uri(obj.left_image.url) if request else obj.left_image.url
        return ""

    def get_right_image_url(self, obj):
        request = self.context.get("request")
        if obj.right_image and hasattr(obj.right_image, "url"):
            return request.build_absolute_uri(obj.right_image.url) if request else obj.right_image.url
        return ""


class CarousalBanner1Serializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    right_image_url = serializers.SerializerMethodField()

    class Meta:
        model = CarousalBanner1
        fields = [
            "id",
            "title",
            "subtitle",
            "button_text",
            "link",
            "image_url",
            "right_image_url",
        ]

    def get_image_url(self, obj):
        request = self.context.get("request")
        return request.build_absolute_uri(obj.image.url) if obj.image else None

    def get_right_image_url(self, obj):
        request = self.context.get("request")
        return request.build_absolute_uri(obj.right_image.url) if obj.right_image else None

class PetServiceSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PetService
        fields = ("id", "title", "slug", "short_description", "promo_text", "image_url", "order")

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class OfferStripSerializer(serializers.ModelSerializer):
    product_image_url = serializers.SerializerMethodField()

    class Meta:
        model = OfferStrip
        fields = (
            "id",
            "title",
            "subtitle",
            "product_image_url",
            "button_text",
            "link",
            "background_color",
            "text_color",
            "order",
        )

    def get_product_image_url(self, obj):
        request = self.context.get("request")
        if obj.product_image and request:
            return request.build_absolute_uri(obj.product_image.url)
        elif obj.product_image:
            return obj.product_image.url
        return None


class PromoBannerSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PromoBanner
        fields = ("id", "title", "subtitle", "button_text", "discount_text", "image_url", "link")

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        elif obj.image:
            return obj.image.url
        return None


class PetCategorySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = HomeCategory
        fields = ('id', 'title', 'slug', 'description', 'image_url')

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        if obj.image:
            return obj.image.url
        return None
