from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PetCategoryViewSet,
    PetProductViewSet,
    PetBannerViewSet,
    PetPageViewSet,
)
from .product_detail_views import PetProductDetailAPIView, ProductReviewCreateAPIView
from .views_cart import CartViewSet

router = DefaultRouter()
router.register(r"pet-categories", PetCategoryViewSet, basename="pet-category")
router.register(r"pet-products", PetProductViewSet, basename="pet-product")
router.register(r"pet-banners", PetBannerViewSet, basename="pet-banner")
router.register(r"pet-page", PetPageViewSet, basename="pet-page")
router.register(r'cart', CartViewSet, basename='cart')

urlpatterns = [
    path("", include(router.urls)),
    path("pet-product/<int:id>/", PetProductDetailAPIView.as_view(), name="pet-product-detail"),
    path("pet-product/<int:id>/reviews/", ProductReviewCreateAPIView.as_view(), name="pet-product-reviews"),
]


# below for path endpoints for cart
# from django.urls import path, include
# from .views_cart import (
#     AddToCartAPIView, CartRetrieveAPIView,
#     CartItemUpdateAPIView, CartItemDeleteAPIView, ClearCartAPIView
# )

# urlpatterns += [
#     path("cart/add/", AddToCartAPIView.as_view(), name="cart-add"),
#     path("cart/", CartRetrieveAPIView.as_view(), name="cart-get"),
#     path("cart/item/<int:id>/", CartItemUpdateAPIView.as_view(), name="cart-item-update"),
#     path("cart/item/<int:id>/delete/", CartItemDeleteAPIView.as_view(), name="cart-item-delete"),
#     path("cart/clear/", ClearCartAPIView.as_view(), name="cart-clear"),
# ]
