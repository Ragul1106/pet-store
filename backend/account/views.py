from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model

from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()

class AccountViewSet(viewsets.GenericViewSet):
    """
    Provides:
      POST /api/account/register/   -> register (AllowAny)
      GET  /api/account/me/         -> current user (IsAuthenticated)
      POST /api/account/logout/     -> logout (IsAuthenticated)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        return super().get_permissions()   # <-- important fix

    @action(detail=False, methods=["post"], url_path="register", permission_classes=[AllowAny])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            UserSerializer(user, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["get"], url_path="me", permission_classes=[IsAuthenticated])
    def me(self, request):
        return Response(UserSerializer(request.user).data)

    @action(detail=False, methods=["post"], url_path="logout", permission_classes=[IsAuthenticated])
    def logout(self, request):
        return Response({"detail": "Logged out"}, status=status.HTTP_200_OK)
