# petshop/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import PetCategory, PetProduct, PetBanner, ProductReview

@admin.register(PetCategory)
class PetCategoryAdmin(admin.ModelAdmin):
    list_display = ("title", "pet_type", "group", "order", "thumb")
    list_filter = ("pet_type", "group")
    search_fields = ("title", "subtitle")
    ordering = ("pet_type", "group", "order", "id")

    def thumb(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:40px;border-radius:4px;object-fit:cover;"/>', obj.image.url)
        return "-"


@admin.register(PetProduct)
class PetProductAdmin(admin.ModelAdmin):
    list_display = ("title", "pet_type", "brand", "price", "quantity_display", "rating", "rating_count", "is_active")
    list_filter = ("pet_type", "is_active", "rating", "quantity_unit")
    search_fields = ("title", "brand")
    filter_horizontal = ("related",)
    ordering = ("pet_type", "order", "-created")

    def thumb(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:40px;object-fit:contain;"/>', obj.image.url)
        return "-"


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ("product", "name", "rating", "created")
    search_fields = ("name", "product__title")
    list_filter = ("rating",)

@admin.register(PetBanner)
class PetBannerAdmin(admin.ModelAdmin):
    list_display = ("pet_type", "title")
    list_filter = ("pet_type",)
    search_fields = ("title",)

from .models_cart import Cart, CartItem  # import models_cart import Cart, CartItem

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ("price_snapshot",)

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "token", "user", "item_count", "subtotal", "is_active")
    readonly_fields = ("token", "subtotal", "item_count")
    inlines = [CartItemInline]

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("id", "cart", "product", "quantity", "price_snapshot", "subtotal")
    readonly_fields = ("subtotal",)



# from django.contrib import admin
# from django.utils.html import format_html
# from .models import PetCategory, PetProduct, PetBanner

# @admin.register(PetCategory)
# class PetCategoryAdmin(admin.ModelAdmin):
#     list_display = ("title", "pet_type", "group", "order", "thumb")
#     list_filter = ("pet_type", "group")
#     search_fields = ("title", "subtitle")
#     ordering = ("pet_type", "group", "order", "id")

#     def thumb(self, obj):
#         if obj.image:
#             return format_html('<img src="{}" style="height:40px;border-radius:4px;object-fit:cover;"/>', obj.image.url)
#         return "-"

# @admin.register(PetProduct)
# class PetProductAdmin(admin.ModelAdmin):
#     list_display = ("title", "pet_type", "price", "quantity_display", "rating", "rating_count", "is_active")
#     list_filter = ("pet_type", "is_active", "rating", "quantity_unit")
#     search_fields = ("title",)

#     ordering = ("pet_type", "order", "-created")

#     def thumb(self, obj):
#         if obj.image:
#             return format_html('<img src="{}" style="height:40px;object-fit:contain;"/>', obj.image.url)
#         return "-"

# @admin.register(PetBanner)
# class PetBannerAdmin(admin.ModelAdmin):
#     list_display = ("pet_type", "title")
#     list_filter = ("pet_type",)
#     search_fields = ("title",)

