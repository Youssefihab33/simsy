from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied
from .serializers import *
import random
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
User = get_user_model()

# Keep the commented-out code for future reference but they won't work due to performance issues
"""
class GenreView(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [permissions.AllowAny]

class RatingView(viewsets.ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [permissions.AllowAny]

class LabelView(viewsets.ModelViewSet):
    queryset = Label.objects.all()
    serializer_class = LabelSerializer
    permission_classes = [permissions.AllowAny]

class LanguageView(viewsets.ModelViewSet):
    queryset = Language.objects.all()
    serializer_class = LanguageSerializer
    permission_classes = [permissions.AllowAny]
    
class CountryView(viewsets.ModelViewSet):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    permission_classes = [permissions.AllowAny]

class ArtistView(viewsets.ModelViewSet):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer
    permission_classes = [permissions.AllowAny]

class ShowView(viewsets.ModelViewSet):
    queryset = Show.objects.all()
    serializer_class = ShowSerializer
    permission_classes = [permissions.AllowAny]
"""
class FavoriteShowsView(viewsets.ModelViewSet):
    serializer_class = ShowCardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            raise PermissionDenied("Log in to view favorites.")
        return Show.objects.filter(favorites=self.request.user)

class WatchlistShowsView(viewsets.ModelViewSet):
    serializer_class = ShowCardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            raise PermissionDenied("Log in to view watchlist.")
        return Show.objects.filter(watchlist=self.request.user)

class NewShowsView(viewsets.ModelViewSet):
    queryset = Show.objects.order_by('-updated')[:10]
    serializer_class = ShowCardSerializer
    permission_classes = [permissions.AllowAny]

class HistoryShowsView(viewsets.ModelViewSet):
    # Empty queryset for now, as we don't have a model to track user history
    queryset = Show.objects.none()  # Placeholder, will be replaced with actual history tracking
    serializer_class = ShowCardSerializer
    permission_classes = [permissions.IsAuthenticated]

    # def get_queryset(self):
    #     if not self.request.user.is_authenticated:
    #         raise PermissionDenied("Log in to view history.")
    #     # **IMPORTANT:** Update this to filter by the current user's history
    #     # You'll need a model to track user watch history.
    #     # Example: return Show.objects.filter(history_records__user=self.request.user).order_by('-history_records__watched_at')[:15]
    #     return Show.objects.order_by('-updated')[:15] # Placeholder

class RandomShowsView(viewsets.ModelViewSet):
    serializer_class = ShowCardSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        all_shows = Show.objects.all()
        if all_shows.count() > 10:
            return random.sample(list(all_shows), 10)
        return all_shows