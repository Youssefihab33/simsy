from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.decorators import login_required
from django.dispatch import receiver
from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django_rest_passwordreset.signals import reset_password_token_created, post_password_reset # type: ignore
from knox.models import AuthToken # type: ignore
from datetime import datetime
from .serializers import *
from .models import *
import os
User = get_user_model()


def send_email(subject, template, user, btnLink=""):
    context = {
        'name': user.username,
        'email': user.email,
        'year': datetime.now().year,
        'button_link': btnLink,
        'link_to_simsy': os.getenv('FRONTEND_DOMAIN'),
        'admin_email': os.getenv('EMAIL_HOST'),
    }
    html_content = render_to_string(template, context)
    plain_message = strip_tags(html_content)
    message = EmailMultiAlternatives(
        subject=subject,
        body=plain_message,
        from_email=None,
        to=[user.email],
    )
    message.attach_alternative(html_content, "text/html")
    message.send()

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
                send_email('Login Notification - SIMSY',
                           'email/login.html', user, 'DO LATER')                # A DO LATER HERE
                # Create token for the user
                token = AuthToken.objects.create(user)[1]
                return Response({'user': self.serializer_class(user).data, 'token': token})
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
            return Response(serializer.data, status=201)
        else:
            return Response(serializer.errors, status=400)


class UserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            serializer = UserSerializer(request.user)
            return Response(serializer.data, status=200)
        except CustomUser.DoesNotExist:
            # Handle the case where a profile doesn't exist (optional)
            return Response({'error': 'Profile not found'}, status=404)


@receiver(reset_password_token_created)
def password_reset_token_created(reset_password_token, *args, **kwargs):
    token_url = f'{os.getenv('FRONTEND_DOMAIN')}reset-password/{reset_password_token.key}'
    send_email("Forgot your Password? - SIMSY",
               'email/forgot_password.html', reset_password_token.user, token_url)


@receiver(post_password_reset)
def password_reset(sender, **kwargs):
    send_email("Password Changed Successfully - SIMSY",
               # A DO LATER HERE
               'email/password_changed.html', kwargs['user'], 'DO LATER')
