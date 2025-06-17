from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import RegisterViewSet, LoginViewSet

router = DefaultRouter()
router.register('register', RegisterViewSet, basename='register')
router.register('login', LoginViewSet, basename='login')

urlpatterns = router.urls
