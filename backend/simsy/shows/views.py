from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import *
import random
from collections import OrderedDict
from datetime import datetime
from .models import Show
from django.contrib.auth import get_user_model
User = get_user_model()

class ShowDetailView(RetrieveAPIView):
    queryset = Show.objects.all()
    serializer_class = ShowSerializer
    lookup_field = 'pk'
    lookup_url_kwarg = 'show_id'

    def get_favorites_status(self, show):
        if not self.request.user.is_authenticated:
            return False
        return show.favorites.filter(id=self.request.user.id).exists()

    def get_watchlist_status(self, show):
        if not self.request.user.is_authenticated:
            return False
        return show.watchlist.filter(id=self.request.user.id).exists()

class UserShowView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, show_id):
        try:
            serializer = UserShowSerializer(
                request.user, context={'request': request, 'show_id': show_id})
            return Response(serializer.data, status=200)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


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
    # Placeholder, will be replaced with actual history tracking
    serializer_class = ShowCardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            raise PermissionDenied("Log in to view history.")

        user = self.request.user

        if not user.history:
            return Show.objects.none()

        # List to store (datetime_object, show_id) tuples for sorting
        timestamped_shows = []

        # Iterate through the history data to extract all show IDs with their exact timestamps
        for date_str, time_data in user.history.items():
            for time_str, show_id in time_data.items():
                try:
                    # Combine date and time strings and parse into a datetime object
                    full_datetime_str = f"{date_str} {time_str}"
                    dt_object = datetime.strptime(
                        full_datetime_str, "%Y-%m-%d %H:%M:%S")
                    timestamped_shows.append((dt_object, show_id))
                except ValueError:
                    # Log a warning if a datetime string cannot be parsed, but continue processing
                    print(
                        f"Warning: Could not parse datetime from history: {full_datetime_str}")
                    continue

        # Sort the list by datetime object in descending order (latest show first)
        timestamped_shows.sort(key=lambda x: x[0], reverse=True)

        # Extract unique show IDs while preserving their order of appearance (latest first)
        # Using OrderedDict to maintain insertion order and ensure uniqueness
        unique_show_ids_ordered = OrderedDict()
        for _, show_id in timestamped_shows:
            # The value doesn't matter, only the key's presence
            unique_show_ids_ordered[show_id] = None

        # Get the list of the latest 10 unique show IDs
        latest_unique_show_ids = list(unique_show_ids_ordered.keys())[:10]

        # Fetch the Show objects corresponding to these IDs
        # Note: Querying with id__in does not guarantee the order.
        shows = Show.objects.filter(id__in=latest_unique_show_ids)

        # Create a dictionary for quick lookup of fetched shows by their ID
        shows_by_id = {show.id: show for show in shows}

        # Reorder the fetched shows to match the desired order of the latest unique show IDs
        # This ensures the API response reflects the most recently watched shows first
        ordered_shows = [shows_by_id[show_id]
                         for show_id in latest_unique_show_ids
                         if show_id in shows_by_id]  # Ensure the show actually exists

        return ordered_shows

class RandomShowsView(viewsets.ModelViewSet):
    serializer_class = ShowCardSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        all_shows = Show.objects.all()
        if all_shows.count() > 10:
            return random.sample(list(all_shows), 10)
        return all_shows

class ToggleFavoriteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, show_id):
        try:
            show = Show.objects.get(id=show_id)
        except Show.DoesNotExist:
            return Response({'detail': 'Show not found!'}, status=status.HTTP_404_NOT_FOUND)

        if show in request.user.favorite_shows.all():
            show.favorites.remove(request.user.id)
            message = 'Show removed from favorites successfully!'
            current_status = False
        else:
            show.favorites.add(request.user.id)
            message = 'Show added to favorites successfully!'
            current_status = True

        return Response({
            'message': message,
            'in_favorites': current_status
        }, status=status.HTTP_200_OK)

class ToggleWatchlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, show_id):
        try:
            show = Show.objects.get(id=show_id)
        except Show.DoesNotExist:
            return Response({'detail': 'Show not found!'}, status=status.HTTP_404_NOT_FOUND)

        if show in request.user.watchlist_shows.all():
            show.watchlist.remove(request.user.id)
            message = 'Show removed from watchlist successfully!'
            current_status = False
        else:
            show.watchlist.add(request.user.id)
            message = 'Show added to watchlist successfully!'
            current_status = True

        return Response({
            'message': message,
            'in_watchlist': current_status
        }, status=status.HTTP_200_OK)

class UpdateTimeReached(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, show_id, season, episode, time_reached):
        try:
            show = Show.objects.get(id=show_id)
        except Show.DoesNotExist:
            return Response({'detail': 'Show not found!'}, status=status.HTTP_404_NOT_FOUND)

        if str(show.id) not in request.user.time_reached:
            request.user.time_reached[str(show.id)] = {}

        match show.kind:
            case 'film':
                request.user.time_reached[str(show.id)] = time_reached
                request.user.save()
                message = f'Updated time_reached for the Film \'{show.name}\' to {time_reached}'
            case 'series' | 'program':
                # Ensure the dictionary for the season exists within that show_id
                if str(season) not in request.user.time_reached[str(show.id)]:
                    request.user.time_reached[str(show.id)][str(season)] = {}
                request.user.time_reached[str(show.id)][str(
                    season)][str(episode)] = time_reached
                request.user.save()
                message = f'Updated time_reached for the {show.kind.title()} \'{show.name}\' Season {season} Episode {episode} to {time_reached}'
            case _:
                return Response({'detail': 'Unknown Show Type!'}, status=status.HTTP_417_EXPECTATION_FAILED)

        return Response({
            'message': message,
            'new_time_reached': time_reached
        }, status=status.HTTP_200_OK)