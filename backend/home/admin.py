from django.contrib import admin
from .models import HomeCategory
from .models import PromoBanner
from .models import OfferStrip
from .models import PetService
from .models import CarousalBanner1
from .models import CarousalBanner2
from django.utils.html import format_html
from django.contrib import admin
from django.utils.html import format_html
from .models import CarousalBanner3


@admin.register(CarousalBanner3)
class CarousalBanner3Admin(admin.ModelAdmin):
    list_display = ("id", "button_text", "diamond_text", "save_text", "active", "order", "created_at")
    list_editable = ("active", "order")
    readonly_fields = ("left1_preview", "left2_preview", "right_preview")
    search_fields = ("button_text", "diamond_text", "save_text")
    list_filter = ("active",)

    fieldsets = (
        (None, {
            "fields": (
                "diamond_text",
                "save_text",
                "button_text",
                "button_link",
                "bg_color",
                "active",
                "order",
            )
        }),
        ("Images", {
            "fields": (
                "left1_preview",
                "left_image_1",
                "left2_preview",
                "left_image_2",
                "right_preview",
                "right_image",
            )
        }),
    )

    def left1_preview(self, obj):
        if obj.left_image_1:
            return format_html('<img src="{}" style="max-height:120px;"/>', obj.left_image_1.url)
        return "-"
    left1_preview.short_description = "Left image 1"

    def left2_preview(self, obj):
        if obj.left_image_2:
            return format_html('<img src="{}" style="max-height:120px;"/>', obj.left_image_2.url)
        return "-"
    left2_preview.short_description = "Left image 2"

    def right_preview(self, obj):
        if obj.right_image:
            return format_html('<img src="{}" style="max-height:120px;"/>', obj.right_image.url)
        return "-"
    right_preview.short_description = "Right image"


@admin.register(CarousalBanner2)
class CarousalBanner2Admin(admin.ModelAdmin):
    list_display = ("id", "ribbon_text", "active", "order", "created_at")
    list_editable = ("active", "order")
    readonly_fields = ("left_preview", "right_preview")
    fields = (
        "left_preview",
        "left_image",
        "right_preview",
        "right_image",
        "ribbon_text",
        "overlay_title",
        "overlay_body",
        "button_text",
        "button_link",
        "active",
        "order",
    )

    def left_preview(self, obj):
        if obj.left_image:
            return format_html('<img src="{}" style="max-height:120px;"/>', obj.left_image.url)
        return "-"
    left_preview.short_description = "Left image preview"

    def right_preview(self, obj):
        if obj.right_image:
            return format_html('<img src="{}" style="max-height:120px;"/>', obj.right_image.url)
        return "-"
    right_preview.short_description = "Right image preview"


@admin.register(CarousalBanner1)
class CarousalBanner1Admin(admin.ModelAdmin):
    list_display = ("title", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("title", "subtitle")



@admin.register(PetService)
class PetServiceAdmin(admin.ModelAdmin):
    list_display = ("title", "order")
    prepopulated_fields = {"slug": ("title",)}
    list_editable = ("order",)


@admin.register(OfferStrip)
class OfferStripAdmin(admin.ModelAdmin):
    list_display = ("title", "button_text", "order")
    list_editable = ("order",)


@admin.register(PromoBanner)
class PromoBannerAdmin(admin.ModelAdmin):
    list_display = ("title", "discount_text", "button_text")

@admin.register(HomeCategory)
class PetCategoryAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug')
    prepopulated_fields = {"slug": ("title",)}
