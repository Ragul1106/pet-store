from rest_framework import serializers
from .models import PetServiceLanding
from .models import PetServicesPage, ServiceCard
from .models import ConsultPage, VetDoctor
from rest_framework import serializers
from rest_framework import serializers
from .models import BookingService

class BookingServiceSerializer(serializers.ModelSerializer):
    banner = serializers.ImageField()

    class Meta:
        model = BookingService
        fields = [
            "id",
            "banner",
            "feature_1",
            "feature_2",
            "feature_3",
            "overlay_title",
            "overlay_text",
            "overlay_cta_text",
            "price",
            "mrp",
            "discount_text",
            "offers_text",
            "offers_button_text",
            "cod_info",
            "delivery_info",
            "add_to_cart_text",
            "rating",
            "created_at",
        ]


#-----

class ConsultPageSerializer(serializers.ModelSerializer):
    banner = serializers.ImageField()
    cta_top_image = serializers.ImageField(allow_null=True, required=False)

    class Meta:
        model = ConsultPage
        fields = [
            "id",
            "banner",
            "overlay_title",
            "overlay_text",
            "overlay_cta_text",
            "cta_top_image",
            "cta_text",
            "cta_button_text",
            "created_at",
        ]


class VetDoctorSerializer(serializers.ModelSerializer):
    photo = serializers.ImageField()

    class Meta:
        model = VetDoctor
        fields = ["id", "name", "short_title", "photo", "description", "order"]



#-----


class ServiceCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCard
        fields = ["id", "title", "content", "button_text", "order"]

class PetServicesPageSerializer(serializers.ModelSerializer):
    center_image = serializers.SerializerMethodField()

    class Meta:
        model = PetServicesPage
        fields = [
            "id",
            "title",
            "intro_text",
            "customer_service_title",
            "customer_phone",
            "promo_left_title",
            "promo_left_subtitle",
            "promo_left_button",
            "center_image",
            "promo_right_title",
            "promo_right_text",
            "promo_right_button",
            "created_at",
        ]

    def get_center_image(self, obj):
        # return absolute URL (works even if request missing)
        request = self.context.get("request")
        if not obj.center_image:
            return None
        url = obj.center_image.url
        return request.build_absolute_uri(url) if request else url




class PetServiceLandingSerializer(serializers.ModelSerializer):
    left_banner = serializers.ImageField()
    right_banner = serializers.ImageField()
    logo = serializers.ImageField()

    class Meta:
        model = PetServiceLanding
        fields = ["id", "left_banner", "right_banner", "logo", "created_at"]
