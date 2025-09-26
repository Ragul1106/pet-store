# petshop/viewsets_cart.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models_cart import Cart, CartItem
from .models import PetProduct
from .serializers_cart import CartSerializer, CartItemSerializer


def _get_or_create_cart_from_request(request):
    token = request.headers.get("X-Cart-Token") or request.query_params.get("token")
    cart = None
    if token:
        cart = Cart.objects.filter(token=token, is_active=True).first()
    if not cart:
        cart = Cart.objects.create()
    if request.user and request.user.is_authenticated and cart.user is None:
        cart.user = request.user
        cart.save(update_fields=["user"])
    return cart


class CartViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def list(self, request):
        cart = _get_or_create_cart_from_request(request)
        serializer = CartSerializer(cart, context={"request": request})
        headers = {"X-Cart-Token": str(cart.token)}
        return Response(serializer.data, headers=headers)

    @action(methods=["post"], detail=False, url_path="add")
    def add(self, request):
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1) or 1)
        if not product_id:
            return Response({"detail": "product_id required"}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(PetProduct, id=product_id, is_active=True)
        cart = _get_or_create_cart_from_request(request)

        with transaction.atomic():
            item, created = CartItem.objects.select_for_update().get_or_create(
                cart=cart,
                product=product,
                defaults={"quantity": quantity, "price_snapshot": product.price},
            )
            if not created:
                item.quantity = max(1, item.quantity + quantity)
                item.price_snapshot = product.price
                item.save()

        serializer = CartSerializer(cart, context={"request": request})
        data = serializer.data
        data["token"] = str(cart.token)
        return Response(data, headers={"X-Cart-Token": str(cart.token)})

    @action(methods=["post"], detail=False, url_path="clear")
    def clear(self, request):
        cart = _get_or_create_cart_from_request(request)
        cart.items.all().delete()
        serializer = CartSerializer(cart, context={"request": request})
        return Response(serializer.data)

    def partial_update(self, request, pk=None):
        item = get_object_or_404(CartItem, id=pk)
        qty = request.data.get("quantity")
        if qty is None:
            return Response({"detail": "quantity required"}, status=status.HTTP_400_BAD_REQUEST)
        item.quantity = max(1, int(qty))
        item.save(update_fields=["quantity"])
        return Response(CartSerializer(item.cart, context={"request": request}).data)

    def destroy(self, request, pk=None):
        item = get_object_or_404(CartItem, id=pk)
        cart = item.cart
        item.delete()
        return Response(CartSerializer(cart, context={"request": request}).data)

    def retrieve(self, request, pk=None):
        item = get_object_or_404(CartItem, id=pk)
        return Response(CartItemSerializer(item, context={"request": request}).data)




# from rest_framework import status, generics
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny
# from rest_framework.views import APIView
# from django.shortcuts import get_object_or_404
# from django.db import IntegrityError, transaction

# from .models import Cart, CartItem, PetProduct
# from .serializers_cart import CartSerializer, CartItemSerializer

# def get_or_create_cart_from_request(request):
#     token = request.headers.get("X-Cart-Token") or request.query_params.get("token")
#     cart = None
#     if token:
#         try:
#             cart = Cart.objects.filter(token=token, is_active=True).first()
#         except Exception:
#             cart = None
#     if not cart:
#         cart = Cart.objects.create()
#     # if authenticated user and cart.user is None, optionally attach
#     if request.user and request.user.is_authenticated and cart.user is None:
#         cart.user = request.user
#         cart.save(update_fields=["user"])
#     return cart

# class AddToCartAPIView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         """
#         body: { product_id: <int>, quantity: <int> }
#         returns cart serialized and X-Cart-Token header
#         """
#         product_id = request.data.get("product_id")
#         quantity = int(request.data.get("quantity", 1) or 1)
#         if not product_id:
#             return Response({"detail": "product_id required"}, status=status.HTTP_400_BAD_REQUEST)

#         product = get_object_or_404(PetProduct, id=product_id, is_active=True)
#         cart = get_or_create_cart_from_request(request)

#         # atomic create/update
#         try:
#             with transaction.atomic():
#                 item, created = CartItem.objects.select_for_update().get_or_create(
#                     cart=cart, product=product,
#                     defaults={"quantity": quantity, "price_snapshot": product.price}
#                 )
#                 if not created:
#                     item.quantity = max(1, item.quantity + quantity)
#                     item.price_snapshot = product.price
#                     item.save()
#         except IntegrityError:
#             return Response({"detail": "Could not add item"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#         serialized = CartSerializer(cart, context={"request": request})
#         headers = {"X-Cart-Token": str(cart.token)}
#         return Response(serialized.data, status=status.HTTP_200_OK, headers=headers)


# class CartRetrieveAPIView(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request):
#         cart = get_or_create_cart_from_request(request)
#         serializer = CartSerializer(cart, context={"request": request})
#         headers = {"X-Cart-Token": str(cart.token)}
#         return Response(serializer.data, headers=headers)


# class CartItemUpdateAPIView(generics.UpdateAPIView):
#     permission_classes = [AllowAny]
#     queryset = CartItem.objects.all()
#     serializer_class = CartItemSerializer
#     lookup_field = "id"

#     def patch(self, request, id):
#         item = get_object_or_404(CartItem, id=id)
#         qty = request.data.get("quantity")
#         if qty is None:
#             return Response({"detail": "quantity required"}, status=status.HTTP_400_BAD_REQUEST)
#         item.quantity = max(1, int(qty))
#         item.save(update_fields=["quantity"])
#         return Response(CartSerializer(item.cart, context={"request": request}).data)


# class CartItemDeleteAPIView(APIView):
#     permission_classes = [AllowAny]

#     def delete(self, request, id):
#         item = get_object_or_404(CartItem, id=id)
#         cart = item.cart
#         item.delete()
#         return Response(CartSerializer(cart, context={"request": request}).data)


# class ClearCartAPIView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         cart = get_or_create_cart_from_request(request)
#         cart.items.all().delete()
#         return Response(CartSerializer(cart, context={"request": request}).data)
