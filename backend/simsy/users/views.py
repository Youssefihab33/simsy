from django.shortcuts import render
from rest_framework import viewsets, permissions
from .serializers import *
from .models import *
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from knox.models import AuthToken

import os
from datetime import datetime
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

User = get_user_model()

# Create your views here.

class LoginViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(request, username=username, password=password)
            if user:
                # Send email notification
                context = {
                    'username': user.username,
                    'email': user.email,
                    'year': datetime.now().year,
                    'link_to_website': 'https://simsy.redirectme.net',
                    'admin_email': os.getenv('EMAIL_HOST'),
                }
                html_content = render_to_string('email/login.html', context)
                plain_message = strip_tags(html_content)
                message = EmailMultiAlternatives(
                    subject = "Login Notification - SIMSY",
                    body = plain_message,
                    from_email = None,
                    to=[user.email],
                )
                message.attach_alternative(html_content, "text/html")
                message.send()

                # Create token for the user
                token = AuthToken.objects.create(user)[1]
                return Response({'user':self.serializer_class(user).data, 'token': token})
            else:
                return Response({'error': 'Invalid credentials'}, status=401)
        else:
            return Response(serializer.errors, status=400)

class RegisterViewSet(viewsets.ViewSet):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)