from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from users.views import UserView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('users.urls')),
    path('api/auth/', include('knox.urls')),
    path('api/profile/', UserView.as_view(), name='user-profile'),
    path('api/password_reset/',
         include('django_rest_passwordreset.urls', namespace='password_reset')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
