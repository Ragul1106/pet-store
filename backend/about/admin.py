from django.contrib import admin
from .models import AboutPage
from .models import AboutCard
from .models import AboutHighlight

@admin.register(AboutHighlight)
class AboutHighlightAdmin(admin.ModelAdmin):
    list_display = ("title", "is_active", "order")
    list_editable = ("is_active", "order")


@admin.register(AboutCard)
class AboutCardAdmin(admin.ModelAdmin):
    list_display = ("title", "order")
    prepopulated_fields = {"slug": ("title",)}
    list_editable = ("order",)


@admin.register(AboutPage)
class AboutPageAdmin(admin.ModelAdmin):
    list_display = ("overlay_title", "is_active", "order")
    list_editable = ("is_active", "order")
