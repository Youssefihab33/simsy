from django.contrib import admin

from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser

# Register your models here.
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'nickname', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active')
    fieldsets = (
        
        (
            "Main information",
            {
                "fields": ['nationality', 'nickname', 'birthday', 'profile_picture', 'bio'],
            },
        ),
        (
            "Advanced options",
            {
                "classes": ["collapse"],
                "fields": ['time_autosave', 'autoplay', 'view_captions', 'remember_home_tab', 'home_tab', 'shows_per_page', 'reached', 'history'],
            },
        ),
    ) + UserAdmin.fieldsets
    search_fields = ('username', 'email', 'nickname')
    ordering = ('username',)
admin.site.register(CustomUser, CustomUserAdmin)