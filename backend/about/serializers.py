from rest_framework import serializers
from .models import AboutPage
from .models import AboutCard
from .models import AboutHighlight

class AboutHighlightSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = AboutHighlight
        fields = ("id", "title", "body_text", "image_url", "is_active", "order")

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None


class AboutCardSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = AboutCard
        fields = ("id", "title", "slug", "description", "link", "image_url", "order")

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None


class AboutPageSerializer(serializers.ModelSerializer):
    hero_image_url = serializers.SerializerMethodField()

    class Meta:
        model = AboutPage
        fields = (
            "id",
            "hero_image_url",
            "overlay_title",
            "overlay_text",
            "body_text",
            "is_active",
            "order",
        )

    def get_hero_image_url(self, obj):
        request = self.context.get("request")
        if obj.hero_image:
            if request:
                return request.build_absolute_uri(obj.hero_image.url)
            return obj.hero_image.url
        return None
