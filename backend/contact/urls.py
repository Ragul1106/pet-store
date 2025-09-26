# contact/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("messages/", views.ContactCreateView.as_view(), name="contact-create"),
    path("messages/list/", views.ContactListView.as_view(), name="contact-list"),  # list for admins
]
