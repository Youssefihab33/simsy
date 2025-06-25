from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from .storage import OverwriteStorage, File_Rename


class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('Username is a required field')

        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, password, **extra_fields)


class CustomUser(AbstractUser):
    username = models.CharField(max_length=30, unique=True)
    email = models.EmailField(unique=True)
    nickname = models.CharField(max_length=30, blank=True, null=True)
    birthday = models.DateField(null=True, blank=True)
    profile_picture = models.ImageField(upload_to=File_Rename(
        'users/profile_pic/'), storage=OverwriteStorage(), blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True, null=True)
    nationality = models.ForeignKey(
        'shows.Country', on_delete=models.CASCADE, blank=True, null=True)

    # shows related fields
    season_reached = models.JSONField(
        encoder=None, decoder=None, default=dict, blank=True)
    episode_reached = models.JSONField(
        encoder=None, decoder=None, default=dict, blank=True)
    time_reached = models.JSONField(
        encoder=None, decoder=None, default=dict, blank=True)
    history = models.JSONField(
        encoder=None, decoder=None, default=dict, blank=True)
    # user preferences
    time_autosave = models.BooleanField(default=True)
    autoplay = models.BooleanField(default=True)
    view_artists = models.BooleanField(default=True)
    view_captions = models.BooleanField(default=True)
    episode_selector_opened = models.BooleanField(default=True)
    remember_home_tab = models.BooleanField(default=True)
    home_tab = models.IntegerField(default=3)

    # Specify the required fields for user creation
    REQUIRED_FIELDS = ['email', 'password']
    objects = CustomUserManager()

    def __str__(self):
        return self.username
