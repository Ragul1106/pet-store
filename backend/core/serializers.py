from rest_framework import serializers
from .models import SiteSettings, MegaMenu, MegaMenuSection, MegaMenuCategory, MegaMenuBrand


def absolute_image_url(obj, request, attr_name):
    """
    Return absolute URL for an ImageField attribute on obj, or None.
    """
    img = getattr(obj, attr_name, None)
    if not img or not hasattr(img, "url"):
        return None
    return request.build_absolute_uri(img.url) if request else img.url


class MegaMenuCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MegaMenuCategory
        fields = ("name",)


class MegaMenuSectionSerializer(serializers.ModelSerializer):
    categories = serializers.SerializerMethodField()

    class Meta:
        model = MegaMenuSection
        fields = ("title", "path", "categories")

    def get_categories(self, obj):
        return [c.name for c in obj.categories.order_by("order", "name")]


class MegaMenuBrandSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = MegaMenuBrand
        fields = ("name", "image", "order")

    def get_image(self, obj):
        request = self.context.get("request")
        return absolute_image_url(obj, request, "image")


class MegaMenuSerializer(serializers.ModelSerializer):
    sections = MegaMenuSectionSerializer(many=True, read_only=True)
    brands = MegaMenuBrandSerializer(many=True, read_only=True)
    left_image = serializers.SerializerMethodField()
    right_image = serializers.SerializerMethodField()

    class Meta:
        model = MegaMenu
        fields = ("key", "title", "title_url", "left_image", "right_image", "sections", "brands")

    def get_left_image(self, obj):
        return absolute_image_url(obj, self.context.get("request"), "left_image")

    def get_right_image(self, obj):
        return absolute_image_url(obj, self.context.get("request"), "right_image")


class SiteSettingsSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = SiteSettings
        fields = ["id", "site_name", "phone", "email", "logo_url", "top_bar_enabled"]

    def get_logo_url(self, obj):
        return absolute_image_url(obj, self.context.get("request"), "logo")
