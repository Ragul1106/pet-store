from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PetServiceLandingViewSet
from rest_framework.routers import DefaultRouter
from .views import PetServicesPageViewSet, ServiceCardViewSet
from .views import ConsultPageViewSet, VetDoctorViewSet
from .views import BookingServiceViewSet

router = DefaultRouter()
router.register(r"petservices", PetServiceLandingViewSet, basename="petservices")
router.register(r"petservicescards", PetServicesPageViewSet, basename="petservicescards")
router.register(r"servicecards", ServiceCardViewSet, basename="servicecards")
router.register(r"consult-page", ConsultPageViewSet, basename="consult-page")
router.register(r"vet-doctors", VetDoctorViewSet, basename="vet-doctors")
router.register(r"booking-service", BookingServiceViewSet, basename="booking-service")


urlpatterns = [
    path("", include(router.urls)),
]


