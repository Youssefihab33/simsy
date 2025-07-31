from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from shows.views import ListCountriesView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('users/', include('users.urls')),
    path('shows/', include('shows.urls')),
    path('auth/', include('knox.urls')),
    path('password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
    path('list_countries/', ListCountriesView.as_view(), name='list_countries')
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
