from django.urls import path
from .views import searchView, UpdateTimeReached, firstEpisode, previousEpisode, nextEpisode, lastEpisode

urlpatterns = [
    path("search/<str:query>/", searchView),
    path("update_time_reached/<int:show_id>/<int:season>/<int:episode>/<int:time_reached>/", UpdateTimeReached.as_view()),
    path("first_episode/<int:show_id>/<int:current_season>/<int:current_episode>/", firstEpisode.as_view()),
    path("previous_episode/<int:show_id>/<int:current_season>/<int:current_episode>/", previousEpisode.as_view()),
    path("next_episode/<int:show_id>/<int:current_season>/<int:current_episode>/", nextEpisode.as_view()),
    path("last_episode/<int:show_id>/<int:current_season>/<int:current_episode>/", lastEpisode.as_view()),
]