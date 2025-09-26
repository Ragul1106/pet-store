from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import PetServiceLanding
from .serializers import PetServiceLandingSerializer
from .models import PetServicesPage, ServiceCard
from .serializers import PetServicesPageSerializer, ServiceCardSerializer
from rest_framework.permissions import AllowAny

from .models import ConsultPage, VetDoctor
from .serializers import ConsultPageSerializer, VetDoctorSerializer


from .models import BookingService
from .serializers import BookingServiceSerializer

class BookingServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only viewset. list() returns the latest BookingService instance
    so frontend can call GET /api/booking-service/ and get the active page content.
    """
    queryset = BookingService.objects.all()
    serializer_class = BookingServiceSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        instance = self.get_queryset().first()
        if not instance:
            return Response(None, status=status.HTTP_200_OK)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)



#------

class ConsultPageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only viewset that returns the latest ConsultPage in list()
    so frontend can call GET /api/consult-page/ and get the active page content.
    """
    queryset = ConsultPage.objects.all()
    serializer_class = ConsultPageSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        instance = self.get_queryset().first()
        if not instance:
            # Return null so frontend can fall back to placeholders
            return Response(None, status=status.HTTP_200_OK)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class VetDoctorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List all VetDoctor entries
    """
    queryset = VetDoctor.objects.all()
    serializer_class = VetDoctorSerializer
    permission_classes = [AllowAny]



#------

class PetServicesPageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PetServicesPage.objects.all()
    serializer_class = PetServicesPageSerializer

    def list(self, request, *args, **kwargs):
        inst = self.get_queryset().first()
        if not inst:
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        serializer = self.get_serializer(inst, context={"request": request})
        return Response(serializer.data)

class ServiceCardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ServiceCard.objects.select_related("page").all()
    serializer_class = ServiceCardSerializer



class PetServiceLandingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PetServiceLanding.objects.all()
    serializer_class = PetServiceLandingSerializer

    # override list() to return the latest instance (or 204 if none)
    def list(self, request, *args, **kwargs):
        instance = self.get_queryset().first()
        if not instance:
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
