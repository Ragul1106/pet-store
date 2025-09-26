from django.contrib import admin
from django.utils.html import format_html
from .models import SiteSettings, MegaMenu, MegaMenuSection, MegaMenuCategory, MegaMenuBrand


class MegaMenuBrandInline(admin.TabularInline):
    model = MegaMenuBrand
    extra = 1
    fields = ("order", "name", "image", "image_thumb")
    readonly_fields = ("image_thumb",)
    ordering = ("order",)

    def image_thumb(self, obj):
        if obj and obj.image:
            return format_html('<img src="{}" style="height:40px;"/>', obj.image.url)
        return "-"
    image_thumb.short_description = "Preview"


@admin.register(MegaMenuBrand)
class MegaMenuBrandAdmin(admin.ModelAdmin):
    list_display = ("name", "mega_menu", "order", "image_thumb")
    list_filter = ("mega_menu",)
    search_fields = ("name",)

    def image_thumb(self, obj):
        if obj and obj.image:
            return format_html('<img src="{}" style="height:40px;"/>', obj.image.url)
        return "-"
    image_thumb.short_description = "Logo"


@admin.register(MegaMenu)
class MegaMenuAdmin(admin.ModelAdmin):
    list_display = ("title", "key", "order", "left_image_display", "right_image_display")
    prepopulated_fields = {"key": ("title",)}
    ordering = ("order",)
    search_fields = ("title", "key")
    inlines = [MegaMenuBrandInline]  # ✅ brands inline

    def left_image_display(self, obj):
        if obj.left_image:
            return format_html('<img src="{}" style="height:40px;"/>', obj.left_image.url)
        return "-"
    left_image_display.short_description = "Left image"

    def right_image_display(self, obj):
        if obj.right_image:
            return format_html('<img src="{}" style="height:40px;"/>', obj.right_image.url)
        return "-"
    right_image_display.short_description = "Right image"


@admin.register(MegaMenuSection)
class MegaMenuSectionAdmin(admin.ModelAdmin):
    list_display = ("title", "mega_menu", "order")
    list_filter = ("mega_menu",)
    ordering = ("mega_menu", "order")
    search_fields = ("title",)


@admin.register(MegaMenuCategory)
class MegaMenuCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "section", "order")
    list_filter = ("section__mega_menu", "section")
    ordering = ("section", "order")
    search_fields = ("name",)


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ("site_name", "phone", "email")
