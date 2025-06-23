from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('genre', GenreView, basename='genre')
router.register('rating', RatingView, basename='rating')
router.register('label', LabelView, basename='label')
router.register('language', LanguageView, basename='language')
router.register('country', CountryView, basename='country')
router.register('artist', ArtistView, basename='artist')
router.register('show', ShowView, basename='show')

urlpatterns = router.urls