from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import *

router = DefaultRouter()
router.register('favoriteShows', FavoriteShowsView, basename='favoriteShows')
router.register('watchlistShows', WatchlistShowsView, basename='watchlistShows')
router.register('newShows', NewShowsView, basename='newShows')
router.register('historyShows', HistoryShowsView, basename='historyShows')
router.register('randomShows', RandomShowsView, basename='randomShows')
urlpatterns = [
    path('show/<int:show_id>/', ShowDetailView.as_view(), name='show-detail'),
    path('user/<int:show_id>/', UserShowView.as_view(), name='user-show-data'),
    path('artist/<int:artist_id>/', ArtistView.as_view(), name='artist'),
    path('country/<int:country_id>/', CountryView.as_view(), name='country'),
    path('search/<str:query>/', searchView, name='search'),
    path('toggleFavorite/<int:show_id>/', ToggleFavoriteView.as_view(), name='toggle-favorite'),
    path('toggleWatchlist/<int:show_id>/', ToggleWatchlistView.as_view(), name='toggle-watchlist'),
    path('update_time_reached/<int:show_id>/<int:season>/<int:episode>/<int:time_reached>/', UpdateTimeReached.as_view(), name='update-time-reached'),
    path('first_episode/<int:show_id>/<int:current_season>/<int:current_episode>/', firstEpisode.as_view(), name='first-episode'),
    path('previous_episode/<int:show_id>/<int:current_season>/<int:current_episode>/', previousEpisode.as_view(), name='previous-episode'),
    path('next_episode/<int:show_id>/<int:current_season>/<int:current_episode>/', nextEpisode.as_view(), name='next-episode'),
    path('last_episode/<int:show_id>/<int:current_season>/<int:current_episode>/', lastEpisode.as_view(), name='last-episode'),
]

urlpatterns += router.urls
