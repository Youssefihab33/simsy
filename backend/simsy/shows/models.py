from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from datetime import date; this_year = date.today().strftime("%Y")
from .storage import OverwriteStorage, File_Rename
User = get_user_model()

# Create your models here.

class Artist(models.Model):
    name        = models.CharField(max_length=100)
    birthYear   = models.IntegerField()
    nationality = models.ForeignKey('Country', on_delete=models.CASCADE, related_name='artists')
    image       = models.ImageField(upload_to=File_Rename("shows/artists/"), storage=OverwriteStorage(), blank=True, max_length=500)
    description = models.TextField(blank=True)

    @property
    def age(self):
        return int(this_year) - int(self.birthYear)
    def __str__(self):
        return self.name
    class Meta:
        ordering = ['name']

class Language(models.Model):
    name        = models.CharField(max_length=50)
    image       = models.ImageField(upload_to=File_Rename("shows/languages/"), storage=OverwriteStorage(), blank=True, max_length=500)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name
    class Meta:
        ordering = ['name']

class Country(models.Model):
    name        = models.CharField(max_length=100)
    languages   = models.ManyToManyField(Language, related_name='countries')
    flag        = models.ImageField(upload_to=File_Rename("shows/countries_flags/"), storage=OverwriteStorage(), blank=True, max_length=500)
    image       = models.ImageField(upload_to=File_Rename("shows/countries/"), storage=OverwriteStorage(), blank=True, max_length=500)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name
    class Meta:
        ordering = ['name']

class Genre(models.Model):
    name        = models.CharField(max_length=50)
    image       = models.ImageField(upload_to=File_Rename("shows/genres/"), storage=OverwriteStorage(), blank=True, max_length=500)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name
    class Meta:
        ordering = ['name']

class Rating(models.Model):
    name        = models.CharField(max_length=50)
    image       = models.ImageField(upload_to=File_Rename("shows/ratings/"), storage=OverwriteStorage(), blank=True, max_length=500)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name
    class Meta:
        ordering = ['id']

class Label(models.Model):
    name        = models.CharField(max_length=50)
    image       = models.ImageField(upload_to=File_Rename("shows/labels/"), storage=OverwriteStorage(), blank=True, max_length=500)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name
    class Meta:
        ordering = ['id']

class Show(models.Model):
    name        = models.CharField(max_length=150)
    year        = models.CharField(max_length=25, default=this_year)
    kind        = models.CharField(max_length=10, choices=[('film', 'Film'),('series', 'Series'),('program', 'Program')], default="film")
    sample      = models.BooleanField(default = False)
    captions    = models.BooleanField(default = False)
    image       = models.ImageField(upload_to=File_Rename("shows/shows/"), storage=OverwriteStorage(), blank=True, max_length=500)
    imdb        = models.TextField(default='<small class="text-muted">IMDB Rating Not Available</small>')
    description = models.TextField(blank=True)

    # Relationships
    countries   = models.ManyToManyField(Country, related_name='shows', blank=True)
    languages   = models.ManyToManyField(Language, related_name='shows', blank=True)
    genres      = models.ManyToManyField(Genre, related_name='shows', blank=True)
    labels      = models.ManyToManyField(Label, related_name='shows', blank=True)
    rating      = models.ForeignKey('Rating', on_delete=models.CASCADE, default="")
    artists     = models.ManyToManyField(Artist, related_name='shows', blank=True)

    episodes    = models.JSONField(encoder=None, decoder=None, default=dict, blank=True)

    favorites   = models.ManyToManyField(User, related_name='favorite_shows', blank=True)
    watchlist   = models.ManyToManyField(User, related_name='watchlist_shows', blank=True)

    finalized   = models.BooleanField(default = False)

    created     = models.DateTimeField(auto_now_add=True)
    updated     = models.DateTimeField(auto_now=True)

    default_popup = '''
    <div class="alert alert-dismissible fade show alert-info" role="alert">
    <h4 class="alert-heading">Well done!</h4>
    <p>Aww yeah, you successfully read this important alert message. This example text is going to run a bit longer so that you can see how spacing within an alert works with this kind of content.</p>
    <hr>
    <p class="mb-0">Whenever you need to, be sure to use margin utilities to keep things nice and tidy.</p>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" onclick="popupClosed();"></button>
    </div>'''
    popup       = models.TextField(blank=True, default=default_popup)

    @property
    def age(self):
        return int(this_year) - int(self.year[0:4])
    def __str__(self):
        return self.name
    class Meta:
        ordering = ["-year","name"]