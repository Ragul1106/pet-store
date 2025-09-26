# account/serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.conf import settings
from django.core.mail import send_mail
from django.utils.crypto import get_random_string

User = get_user_model()

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Allow login with { "email": "...", "password": "..." }.
    Remove the inherited username field so DRF doesn't require it on input,
    then lookup the user by email and inject the username into attrs
    before calling the parent's validate.
    """
    email = serializers.EmailField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        username_field = self.username_field  # usually 'username'
        if username_field in self.fields:
            self.fields.pop(username_field)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise AuthenticationFailed("Must include 'email' and 'password'.")

        try:
            user_obj = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise AuthenticationFailed("No active account found with the given credentials")

        # inject username into attrs so TokenObtainPairSerializer can authenticate
        attrs[self.username_field] = user_obj.get_username()

        data = super().validate(attrs)

        data.update({
            "user": {
                "id": user_obj.id,
                "username": user_obj.username,
                "email": user_obj.email,
                "first_name": getattr(user_obj, "first_name", ""),
                "last_name": getattr(user_obj, "last_name", ""),
            }
        })
        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    phone = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ("email", "password", "first_name", "last_name", "phone")

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

    def _generate_unique_username(self, base):
        """
        Generate a username based on base (usually local-part of email).
        Append a short random string if needed to avoid collisions.
        """
        username = base
        # sanitize base to be safe (strip spaces)
        username = username.replace(" ", "").lower()
        # If username already exists, append short random strings until unique
        while User.objects.filter(username=username).exists():
            suffix = get_random_string(4, allowed_chars="abcdefghijklmnopqrstuvwxyz0123456789")
            username = f"{base[:20]}{suffix}"  # truncate base to avoid long usernames
        return username

    def create(self, validated_data):
        phone = validated_data.pop("phone", "")
        password = validated_data.pop("password")

        # Generate username from email's local part
        email = validated_data.get("email", "")
        local_part = (email.split("@")[0] if "@" in email else email) or "user"
        username_candidate = local_part
        username = self._generate_unique_username(username_candidate)

        # create_user typically requires username if that's the USERNAME_FIELD
        user = User.objects.create_user(username=username, password=password, **validated_data)

        # ensure profile exists and save phone if provided
        try:
            profile = getattr(user, "profile", None)
            if profile is None:
                # import here to avoid circular import if model referenced elsewhere
                from .models import UserProfile
                profile = UserProfile.objects.create(user=user, phone=phone)
            else:
                if phone:
                    profile.phone = phone
                    profile.save()
        except Exception:
            # fail silently for any profile persistence issues in dev; in prod you may want to log
            pass

        # optional: send welcome email (fail silently in dev)
        try:
            subject = getattr(settings, "SITE_WELCOME_SUBJECT", "Welcome")
            from_email = getattr(settings, "DEFAULT_FROM_EMAIL", None)
            message = getattr(
                settings,
                "SITE_WELCOME_MESSAGE",
                f"Hi {user.username},\n\nThanks for signing up."
            )
            if from_email:
                send_mail(subject, message, from_email, [user.email], fail_silently=True)
        except Exception:
            pass

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name")
