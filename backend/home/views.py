from rest_framework import viewsets
from .models import HomeCategory
from .serializers import PetCategorySerializer
from .models import PromoBanner
from .serializers import PromoBannerSerializer
from .models import OfferStrip
from .serializers import OfferStripSerializer
from .models import PetService
from .serializers import PetServiceSerializer
from rest_framework.permissions import AllowAny
from .models import CarousalBanner1
from .serializers import CarousalBanner1Serializer
from rest_framework import viewsets, permissions
from .models import CarousalBanner2
from .serializers import CarousalBanner2Serializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from .models import CarousalBanner3
from .serializers import CarousalBanner3Serializer


class CarousalBanner3ViewSet(viewsets.ModelViewSet):
    queryset = CarousalBanner3.objects.all().order_by("order", "-created_at")
    serializer_class = CarousalBanner3Serializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        # public list/retrieve returns only active entries
        if self.action in ("list", "retrieve"):
            return qs.filter(active=True)
        return qs



class CarousalBanner2ViewSet(viewsets.ModelViewSet):
    """
    CRUD for admin and read for frontend.
    - frontend can GET /api/carousal-banner2/ (list) and /api/carousal-banner2/{id}/
    """
    queryset = CarousalBanner2.objects.all().order_by("order", "-created_at")
    serializer_class = CarousalBanner2Serializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # If called by frontend (AllowAny) we can optionally filter to active banners only
        qs = super().get_queryset()
        if self.action in ("list", "retrieve"):
            # return only active for public endpoints
            return qs.filter(active=True)
        return qs

    @action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def active(self, request):
        qs = self.get_queryset().filter(active=True)
        serializer = self.get_serializer(qs, many=True, context={"request": request})
        return Response(serializer.data)


class CarousalBanner1ViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public API to list active banners
    """
    queryset = CarousalBanner1.objects.filter(is_active=True).order_by("-created_at")
    serializer_class = CarousalBanner1Serializer
    permission_classes = [AllowAny]


class PetServiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PetService.objects.all()
    serializer_class = PetServiceSerializer


class OfferStripViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = OfferStrip.objects.all()
    serializer_class = OfferStripSerializer


class PromoBannerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PromoBanner.objects.all()
    serializer_class = PromoBannerSerializer


class PetCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HomeCategory.objects.order_by('id')
    serializer_class = PetCategorySerializer
