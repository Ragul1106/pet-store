from django.db import models
from django.utils.text import slugify

class AboutHighlight(models.Model):
    title = models.CharField(max_length=200, blank=True)
    body_text = models.TextField()
    image = models.ImageField(upload_to="about/highlight/")
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("order",)

    def __str__(self):
        return self.title or f"AboutHighlight #{self.pk}"


class AboutCard(models.Model):
    title = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    image = models.ImageField(upload_to="about/cards/")
    description = models.TextField(blank=True, help_text="Optional small text below the card")
    link = models.CharField(max_length=255, blank=True, help_text="Optional internal path or external URL")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("order",)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)[:140]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class AboutPage(models.Model):
    hero_image = models.ImageField(upload_to="about/hero/")
    overlay_title = models.CharField(max_length=200, help_text="Big centered title on the hero")
    overlay_text = models.CharField(max_length=400, blank=True, help_text="Small line(s) under title in overlay")
    body_text = models.TextField(help_text="Long content that appears in the green block below the hero")
    is_active = models.BooleanField(default=True, help_text="Enable/disable this about entry (admin chooses which to show)")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("order",)

    def __str__(self):
        return f"AboutPage #{self.pk} - {self.overlay_title[:30]}"
