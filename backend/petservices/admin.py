from django.contrib import admin
from .models import PetServiceLanding
from .models import PetServicesPage, ServiceCard
from .models import ConsultPage, VetDoctor
from .models import BookingService

@admin.register(BookingService)
class BookingServiceAdmin(admin.ModelAdmin):
    list_display = ("id", "overlay_title", "price", "mrp", "rating", "created_at")
    readonly_fields = ("created_at",)


#-----

@admin.register(ConsultPage)
class ConsultPageAdmin(admin.ModelAdmin):
    list_display = ("id", "created_at", "overlay_title")
    readonly_fields = ("created_at",)

@admin.register(VetDoctor)
class VetDoctorAdmin(admin.ModelAdmin):
    list_display = ("name", "short_title", "order")
    ordering = ("order",)



#-----
@admin.register(PetServicesPage)
class PetServicesPageAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "created_at")

@admin.register(ServiceCard)
class ServiceCardAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "order", "page")
    list_editable = ("order",)


@admin.register(PetServiceLanding)
class PetServiceLandingAdmin(admin.ModelAdmin):
    list_display = ("id", "created_at")
    readonly_fields = ("created_at",)
