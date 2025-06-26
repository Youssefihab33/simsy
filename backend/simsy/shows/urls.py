from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import *

router = DefaultRouter()
# router.register('genre', GenreView, basename='genre')
# router.register('rating', RatingView, basename='rating')
# router.register('label', LabelView, basename='label')
# router.register('language', LanguageView, basename='language')
# router.register('country', CountryView, basename='country')
# router.register('artist', ArtistView, basename='artist')
router.register('favoriteShows', FavoriteShowsView, basename='favoriteShows')
router.register('watchlistShows', WatchlistShowsView, basename='watchlistShows')
router.register('newShows', NewShowsView, basename='newShows')
router.register('historyShows', HistoryShowsView, basename='historyShows')
router.register('randomShows', RandomShowsView, basename='randomShows')
# Your custom URL pattern
# Note: You need to import ShowDetailView from your views.py
urlpatterns = [
    path('show/<int:show_id>/', ShowDetailView.as_view(), name='show-detail'),
]

# Append the router's URLs to your custom URLs
urlpatterns += router.urls
