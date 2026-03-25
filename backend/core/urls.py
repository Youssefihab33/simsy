from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from shows.views import ArtistsViewSet, LanguagesViewSet, CountriesViewSet, GenresViewSet, RatingsViewSet, LabelsViewSet, ShowsViewSet
router = DefaultRouter()

router.register('artists', ArtistsViewSet)
router.register('languages', LanguagesViewSet)
router.register('countries', CountriesViewSet)
router.register('genres', GenresViewSet)
router.register('ratings', RatingsViewSet)
router.register('labels', LabelsViewSet)
router.register('shows', ShowsViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('users/', include('users.urls')),
    path('api/', include('shows.urls')),
    path('auth/', include('knox.urls')),
    path('password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns += router.urls