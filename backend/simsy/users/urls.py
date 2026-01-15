from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('register', RegisterViewSet, basename='register')
router.register('login', LoginViewSet, basename='login')
urlpatterns = [
    path('user_info/', UserInfoView.as_view(), name='user_info'),
    path('user_home_tab/', UserHomeTabView.as_view(), name='user_home_tab'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('update_user_data/', UpdateUserData.as_view(), name='update_user_data'),
]

urlpatterns += router.urls
