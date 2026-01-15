from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import *
User = get_user_model()


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret.pop('password', None)
        return ret

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name',
                  'last_name', 'is_active', 'is_staff')
        read_only_fields = ('id', 'is_active', 'is_staff')


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'email', 'first_name',
                  'last_name', 'nickname', 'birthday', 'bio')
        extra_kwargs = {
            'password': {'write_only': True},
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
            'nickname': {'required': False, 'allow_blank': True},
            'birthday': {'required': False, 'allow_null': True},
            'bio': {'required': False, 'allow_blank': True},
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UserHomeTabSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'home_tab']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'profile_picture', 'first_name', 'last_name', 'nickname', 'birthday', 'nationality', 'last_login', 'date_joined']


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'first_name', 'last_name', 'email', 'nickname', 'birthday', 'profile_picture', 'bio', 'nationality', 'time_autosave',
                  'autoplay', 'view_captions', 'remember_home_tab', 'home_tab', 'last_login', 'date_joined', 'is_active', 'is_staff', 'is_superuser']
