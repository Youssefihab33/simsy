from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import RegisterViewSet

router = DefaultRouter()
router.register('register', RegisterViewSet, basename='register')
urlpatterns = router.urls