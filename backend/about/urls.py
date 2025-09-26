from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import AboutPageViewSet
from .views import AboutCardViewSet
from .views import AboutHighlightViewSet

router = DefaultRouter()
router.register(r"about", AboutPageViewSet, basename="aboutpage")
router.register(r"about-cards", AboutCardViewSet, basename="aboutcard")
router.register(r"about-highlights", AboutHighlightViewSet, basename="abouthighlight")

urlpatterns = [
    path("", include(router.urls)),
]
