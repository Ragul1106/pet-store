from rest_framework.routers import DefaultRouter
from .views import SiteSettingsViewSet, MegaMenuViewSet

router = DefaultRouter()
router.register(r"mega-menus", MegaMenuViewSet, basename="mega-menu")
router.register(r"site-settings", SiteSettingsViewSet, basename="site-settings")

urlpatterns = router.urls
