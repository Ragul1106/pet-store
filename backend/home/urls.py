from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PetCategoryViewSet
from .views import PromoBannerViewSet
from .views import OfferStripViewSet
from .views import PetServiceViewSet
from .views import CarousalBanner1ViewSet
from .views import CarousalBanner2ViewSet
from .views import CarousalBanner3ViewSet

router = DefaultRouter()
router.register(r'home-categories', PetCategoryViewSet, basename='homecategory')
router.register(r'promo-banners', PromoBannerViewSet, basename='promobanner')
router.register(r"offer-strips", OfferStripViewSet, basename="offerstrip")
router.register(r"pet-services", PetServiceViewSet, basename="petservice")
router.register(r"carousal-banner1", CarousalBanner1ViewSet, basename="carousal-banner1")
router.register(r"carousal-banner2", CarousalBanner2ViewSet, basename="carousal-banner2")
router.register(r"carousal-banner3", CarousalBanner3ViewSet, basename="carousal-banner3")

urlpatterns = [
    path('', include(router.urls)),
]
