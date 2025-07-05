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
    path('user/<int:show_id>/', UserShowView.as_view(), name='user-show-data'),
    path('toggleFavorite/<int:show_id>/', ToggleFavoriteView.as_view(), name='toggle-favorite'),
    path('toggleWatchlist/<int:show_id>/', ToggleWatchlistView.as_view(), name='toggle-watchlist'),
    path('update_time_reached/<int:show_id>/<int:season>/<int:episode>/<int:time_reached>/', UpdateTimeReached.as_view(), name='update-time-reached'),
]

# Append the router's URLs to your custom URLs
urlpatterns += router.urls
