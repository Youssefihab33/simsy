from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager

# Create your models here.
class CustomUserManager(BaseUserManager): 
    def create_user(self, username, password=None, **extra_fields ): 
        if not username: 
            raise ValueError('Username is a required field')
    
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self,username, password=None, **extra_fields): 
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, password, **extra_fields)
    
class CustomUser(AbstractUser):
    username = models.CharField(max_length=30, unique=True)
    nickname = models.CharField(max_length=30)
    birthday = models.DateField(null=True, blank=True)
    # profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True, null=True)
    # nationality = models.CharField(max_length=100, blank=True, null=True)

    # REQUIRED_FIELDS = ['username']  # Specify the required fields for user creation
    objects = CustomUserManager()
    
    def __str__(self):
        return self.username