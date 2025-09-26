# orders/admin.py
from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    readonly_fields = ("product_id","product_title","price","quantity")
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id","billing_name","status","total","created")
    readonly_fields = ("token","subtotal","total","created")
    inlines = [OrderItemInline]



# from django.contrib import admin
# from .models import Order

# @admin.register(Order)
# class OrderAdmin(admin.ModelAdmin):
#     list_display = ("id", "first_name", "last_name", "status", "total", "created")
#     list_filter = ("status", "payment_method")
#     search_fields = ("first_name", "last_name", "email", "phone")

