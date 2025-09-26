from django.db import models
from django.utils.text import slugify

class MegaMenu(models.Model):
    key = models.SlugField(max_length=100, unique=True)
    title = models.CharField(max_length=200, default="Untitled Menu")
    title_url = models.CharField(max_length=500, blank=True)
    order = models.PositiveIntegerField(default=0)
    
    left_image = models.ImageField(upload_to="mega_menu_images/", blank=True, null=True)
    right_image = models.ImageField(upload_to="mega_menu_images/", blank=True, null=True)

    class Meta:
        ordering = ["order", "title"]

    def __str__(self):
        return f"{self.title} ({self.key})"

class MegaMenuSection(models.Model):
    mega_menu = models.ForeignKey(MegaMenu, related_name="sections", on_delete=models.CASCADE)
    title = models.CharField(max_length=200, help_text="Section title")
    path = models.CharField(max_length=300, blank=True, help_text="Optional URL for this section")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "title"]

    def __str__(self):
        return f"{self.title} — {self.mega_menu.key}"


class MegaMenuCategory(models.Model):
    section = models.ForeignKey(MegaMenuSection, related_name="categories", on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return f"{self.name} — {self.section.title}"

class MegaMenuBrand(models.Model):
    mega_menu = models.ForeignKey(MegaMenu, related_name="brands", on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    image = models.ImageField(upload_to="mega_menu_brands/")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return f"{self.name} ({self.mega_menu.key})"

class SiteSettings(models.Model):
    site_name = models.CharField(max_length=100, default='PetPalooza')
    phone = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    logo = models.ImageField(upload_to='site_logo/', blank=True, null=True)
    top_bar_enabled = models.BooleanField(default=True)


    class Meta:
        verbose_name = 'Site Settings'
        verbose_name_plural = 'Site Settings'


    def __str__(self):
        return self.site_name




