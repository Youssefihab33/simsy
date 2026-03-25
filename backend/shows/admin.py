from django.contrib import admin

# Register your models here.
from .models import *

class languageAdminDisplay(admin.ModelAdmin):
    list_display = ['id','name']
admin.site.register(Language, languageAdminDisplay)

class countryAdminDisplay(admin.ModelAdmin):
    list_display = ['id','name']
admin.site.register(Country, countryAdminDisplay)

class artistAdminDisplay(admin.ModelAdmin):
    list_display = ['id','name','birthYear']
    ordering = ['-id']
    list_max_show_all = 50000
    list_per_page = 10000
admin.site.register(Artist, artistAdminDisplay)

class genreAdminDisplay(admin.ModelAdmin):
    list_display = ['id','name']
admin.site.register(Genre, genreAdminDisplay)

class labelAdminDisplay(admin.ModelAdmin):
    list_display = ['id','name']
admin.site.register(Label, labelAdminDisplay)

class ratingAdminDisplay(admin.ModelAdmin):
    list_display = ['id','name']
admin.site.register(Rating, ratingAdminDisplay)

class showAdminDisplay(admin.ModelAdmin):
    list_display = ['id','name','year','kind', 'sample','captions','rating','finalized','image']
    list_filter = ['finalized', 'labels', 'favorites','watchlist','kind','sample','languages','captions','rating','year']
    ordering = ['-id']
    list_max_show_all = 5000
    list_per_page = 1000
admin.site.register(Show, showAdminDisplay)