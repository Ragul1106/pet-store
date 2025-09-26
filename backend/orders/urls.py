# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from .views import OrderViewSet

# router = DefaultRouter()
# router.register(r"orders", OrderViewSet, basename="orders")

# urlpatterns = [
#     path("", include(router.urls)),
# ]


# orders/urls.py
from django.urls import path
from .views import OrderCreateAPIView, OrderByTokenAPIView
urlpatterns = [
    path("create/", OrderCreateAPIView.as_view(), name="orders-create"),  # POST
    path("by-token/", OrderByTokenAPIView.as_view(), name="orders-by-token"),  # GET ?token=...
    # Optional token/id routes if you want:
    # path("<uuid:token>/", OrderRetrieveByTokenAPIView.as_view(), name="orders-detail-token"),
    # path("id/<int:pk>/", OrderRetrieveByIdAPIView.as_view(), name="orders-detail-id"),
]

