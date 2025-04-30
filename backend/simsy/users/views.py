from django.shortcuts import render
from rest_framework import viewsets, permissions
from .serializers import *
from .models import *
from rest_framework.response import Response
from django.contrib.auth import get_user_model
User = get_user_model()

# Create your views here.
class RegisterViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.IsAdminUser] # Only admin can register new users

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)