# core/views.py
from django.shortcuts import get_object_or_404
from rest_framework import mixins, viewsets
from rest_framework.response import Response

from .models import MegaMenu, SiteSettings
from .serializers import MegaMenuSerializer, SiteSettingsSerializer


class MegaMenuViewSet(viewsets.GenericViewSet, mixins.RetrieveModelMixin, mixins.ListModelMixin):
    """
    Provide:
     - list -> GET /api/mega-menus/         (optional)
     - retrieve -> GET /api/mega-menus/<key>/
    Lookup is by `key` field so frontend can request by key like /mega-menus/dog/
    """
    queryset = MegaMenu.objects.prefetch_related(
        "sections__categories",
        "brands",                  # <- prefetch brands to avoid extra queries
    ).all()
    serializer_class = MegaMenuSerializer
    lookup_field = "key"

    # No need to override retrieve in most cases — the mixin covers it.
    # But if you want a custom error message or custom logic you can override.
    def retrieve(self, request, *args, **kwargs):
        # use DRF's get_object which respects lookup_field and lookup_url_kwarg
        obj = self.get_object()
        # self.get_serializer will include request in context automatically
        serializer = self.get_serializer(obj)
        return Response(serializer.data)


class SiteSettingsViewSet(viewsets.ViewSet):
    """
    Read-only ViewSet that returns the single SiteSettings instance
    at the collection endpoint /api/site-settings/ (detail endpoints are not used).
    """

    def list(self, request):
        obj = SiteSettings.objects.first()
        if not obj:
            return Response({}, status=200)
        serializer = SiteSettingsSerializer(obj, context={"request": request})
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        # route detail to same data (optional)
        return self.list(request)
