from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import UserProfile

User = get_user_model()

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone", "created_at")

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False

try:
    admin.site.unregister(User)
except Exception:
    pass

@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    inlines = (UserProfileInline,)
