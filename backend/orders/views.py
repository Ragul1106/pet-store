# orders/views.py
from decimal import Decimal, InvalidOperation
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import Order, OrderItem
from .serializers import OrderSerializer
from pets.models import PetProduct
from pets.models_cart import Cart  # adjust import path if needed

DEC0 = Decimal("0.00")

def to_decimal(val, default="0.00"):
    if val is None or val == "":
        return Decimal(default)
    try:
        # Always convert from string to avoid float artifacts
        return Decimal(str(val))
    except (InvalidOperation, ValueError, TypeError):
        return Decimal(default)


class OrderCreateAPIView(APIView):
    """
    POST /api/orders/create/
    Accepts either cart_token or buy_now: { product_id, quantity }
    """
    def post(self, request, *args, **kwargs):
        data = request.data
        cart_token = data.get("cart_token")
        buy_now = data.get("buy_now")

        # Billing fields
        billing = {
            "billing_name": data.get("billing_name", ""),
            "billing_email": data.get("billing_email", ""),
            "billing_phone": data.get("billing_phone", ""),
            "billing_address_line1": data.get("billing_address_line1", ""),
            "billing_address_line2": data.get("billing_address_line2", ""),
            "billing_city": data.get("billing_city", ""),
            "billing_state": data.get("billing_state", ""),
            "billing_pincode": data.get("billing_pincode", ""),
            "notes": data.get("notes", ""),
        }
        shipping = to_decimal(data.get("shipping"), "0.00")

        if not (cart_token or buy_now):
            return Response({"detail": "cart_token or buy_now required"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            order = Order.objects.create(
                shipping=shipping,
                **billing,
            )

            subtotal = DEC0

            if buy_now:
                try:
                    pid = int(buy_now.get("product_id"))
                    qty = int(buy_now.get("quantity", 1))
                except (TypeError, ValueError):
                    return Response({"detail": "Invalid buy_now payload"}, status=status.HTTP_400_BAD_REQUEST)
                if qty <= 0:
                    return Response({"detail": "Quantity must be >= 1"}, status=status.HTTP_400_BAD_REQUEST)

                product = get_object_or_404(PetProduct, id=pid, is_active=True)
                price = to_decimal(product.price, "0.00")
                OrderItem.objects.create(
                    order=order,
                    product_id=product.id,
                    product_title=product.title,
                    product_image=(product.image.url if getattr(product, "image", None) else ""),
                    price=price,
                    quantity=qty,
                )
                subtotal += price * qty
            else:
                cart = Cart.objects.filter(token=cart_token, is_active=True).first()
                if not cart:
                    return Response({"detail": "invalid cart token"}, status=status.HTTP_400_BAD_REQUEST)

                for ci in cart.items.select_related("product").all():
                    price = to_decimal(ci.price_snapshot, "0.00")
                    OrderItem.objects.create(
                        order=order,
                        product_id=ci.product.id,
                        product_title=ci.product.title,
                        product_image=(ci.product.image.url if getattr(ci.product, "image", None) else ""),
                        price=price,
                        quantity=ci.quantity,
                    )
                    subtotal += price * ci.quantity

                cart.is_active = False
                cart.save(update_fields=["is_active"])

            order.subtotal = subtotal
            order.total = subtotal + shipping
            order.save(update_fields=["subtotal", "total"])

            serializer = OrderSerializer(order, context={"request": request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)


class OrderByTokenAPIView(APIView):
    """
    GET /api/orders/by-token/?token=<uuid>
    """
    def get(self, request, *args, **kwargs):
        token = request.query_params.get("token")
        if not token:
            return Response({"detail": "token required"}, status=status.HTTP_400_BAD_REQUEST)
        order = get_object_or_404(Order, token=token)
        serializer = OrderSerializer(order, context={"request": request})
        return Response(serializer.data)

    
    
    
    
    
    
    
 # orders/views.py
# from rest_framework import viewsets, status
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny
# from django.shortcuts import get_object_or_404
# from .models import Order
# from .serializers import OrderSerializer
# from pets.models_cart import Cart

# class OrderViewSet(viewsets.ModelViewSet):
#     queryset = Order.objects.all()
#     serializer_class = OrderSerializer
#     permission_classes = [AllowAny]

#     def create(self, request, *args, **kwargs):
#         cart_token = request.data.get("cart_token")
#         cart = get_object_or_404(Cart, token=cart_token, is_active=True)

#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)

#         order = serializer.save(cart=cart)

#         # After order placed, deactivate cart
#         cart.is_active = False
#         cart.save(update_fields=["is_active"])

#         return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


