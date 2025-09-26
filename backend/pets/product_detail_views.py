# petshop/product_detail.py
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import PetProduct, ProductReview
from .serializers_detail import PetProductDetailSerializer, ProductReviewSerializer


class PetProductDetailAPIView(generics.RetrieveAPIView):
    """
    GET /api/pet-product/<id>/
    """
    permission_classes = [AllowAny]
    queryset = PetProduct.objects.filter(is_active=True)
    serializer_class = PetProductDetailSerializer
    lookup_field = "id"


class ProductReviewCreateAPIView(generics.CreateAPIView):
    """
    POST /api/pet-product/<id>/reviews/
    Body: { name, email, rating, review }
    """
    permission_classes = [AllowAny]
    serializer_class = ProductReviewSerializer

    def post(self, request, id, *args, **kwargs):
        product = get_object_or_404(PetProduct, id=id, is_active=True)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(product=product)
        # Optionally update rating_count and aggregate rating (simple approach)
        product.rating_count = product.reviews.count()
        # Simple average rating update (if you'd like):
        avg = product.reviews.aggregate(avg=models.Avg("rating"))["avg"] or product.rating
        product.rating = int(round(avg))
        product.save(update_fields=["rating", "rating_count"])
        return Response(serializer.data, status=status.HTTP_201_CREATED)
