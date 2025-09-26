# petshop/viewsets.py
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from django.core.paginator import Paginator
from rest_framework.response import Response

from .models import PetCategory, PetProduct, PetBanner
from .serializers import (
    PetCategorySerializer,
    PetProductSerializer,
    PetBannerSerializer,
)

PAGE_SIZE = 9


class PetCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = PetCategorySerializer
    queryset = PetCategory.objects.all()

    def get_queryset(self):
        pet_type = self.request.query_params.get("pet_type", "dog")
        return PetCategory.objects.filter(pet_type=pet_type).order_by("order", "id")


class PetProductViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = PetProductSerializer
    queryset = PetProduct.objects.all()

    def get_queryset(self):
        pet_type = self.request.query_params.get("pet_type", "dog")
        return PetProduct.objects.filter(pet_type=pet_type, is_active=True).order_by("order", "-created")


class PetBannerViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = PetBannerSerializer
    queryset = PetBanner.objects.all()

    def get_queryset(self):
        pet_type = self.request.query_params.get("pet_type", "dog")
        return PetBanner.objects.filter(pet_type=pet_type)


class PetPageViewSet(viewsets.ViewSet):
    """
    Combined page payload via DefaultRouter:
    - GET /api/pet-page/         -> defaults to pet_type=dog&page=1
    - GET /api/pet-page/?pet_type=cat&page=2
    """
    permission_classes = [AllowAny]

    def list(self, request):
        pet_type = request.query_params.get("pet_type", "dog")
        page_num = int(request.query_params.get("page", 1))

        categories = PetCategory.objects.filter(pet_type=pet_type).order_by("order", "id")
        products_qs = PetProduct.objects.filter(pet_type=pet_type, is_active=True).order_by("order", "-created")
        banner = PetBanner.objects.filter(pet_type=pet_type).first()

        paginator = Paginator(products_qs, PAGE_SIZE)
        page = paginator.get_page(page_num)

        data = {
            "title": pet_type.capitalize(),
            "promos": PetCategorySerializer(categories, many=True, context={"request": request}).data,
            "sidebar": [{
                "id": 0,
                "title": "Categories",
                "items": PetCategorySerializer(categories, many=True, context={"request": request}).data
            }],
            "products": PetProductSerializer(page.object_list, many=True, context={"request": request}).data,
            "banner": PetBannerSerializer(banner, context={"request": request}).data if banner else None,
            "pagination": {
                "page": page.number,
                "total_pages": paginator.num_pages,
                "total_items": paginator.count,
            },
        }
        return Response(data)
