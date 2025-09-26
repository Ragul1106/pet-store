# account/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import AccountViewSet
# from rest_framework_simplejwt.views import (
#     TokenObtainPairView,
#     TokenRefreshView,
# )

router = DefaultRouter()
router.register(r"account", AccountViewSet, basename="account")

urlpatterns = [
    path("", include(router.urls)),
    # path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    # path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
