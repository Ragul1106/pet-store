from rest_framework import viewsets
from .models import AboutPage
from .serializers import AboutPageSerializer
from .models import AboutCard
from .serializers import AboutCardSerializer
from .models import AboutHighlight
from .serializers import AboutHighlightSerializer

class AboutHighlightViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AboutHighlight.objects.filter(is_active=True).order_by("order")
    serializer_class = AboutHighlightSerializer


class AboutCardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AboutCard.objects.all()
    serializer_class = AboutCardSerializer


class AboutPageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AboutPage.objects.filter(is_active=True).order_by("order")
    serializer_class = AboutPageSerializer
