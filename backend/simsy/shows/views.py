import random
from datetime import datetime
from .imports import updateReached, changeEpisode
from .models import Show
from .serializers import *

from rest_framework import status, permissions, viewsets
from rest_framework.generics import RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.db.models import Case, When, Q
User = get_user_model()


# ------- Home Page Views -------
class ListCountriesView(APIView):
    serializer_class = CountrySerializer
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        countries_data = [country.to_dict()
                          for country in Country.objects.all()]
        return Response(countries_data, status=200)


class FavoriteShowsView(viewsets.ModelViewSet):
    serializer_class = ShowCardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            raise PermissionDenied("Log in to view favorites.")
        if self.request.user.remember_home_tab:
            self.request.user.home_tab = 'favorites'; self.request.user.save()
        return Show.objects.filter(favorites=self.request.user)


class WatchlistShowsView(viewsets.ModelViewSet):
    serializer_class = ShowCardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_authenticated:
            raise PermissionDenied("Log in to view watchlist.")
        if self.request.user.remember_home_tab:
            self.request.user.home_tab = 'watchlist'; self.request.user.save()
        return Show.objects.filter(watchlist=self.request.user)


class NewShowsView(viewsets.ModelViewSet):
    serializer_class = ShowCardSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        if self.request.user.remember_home_tab:
            self.request.user.home_tab = 'new'; self.request.user.save()
        return Show.objects.order_by('-updated')[:25]
    

class HistoryShowsView(viewsets.ModelViewSet):
    serializer_class = ShowCardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.remember_home_tab:
            user.home_tab = 'history'; self.request.user.save()
        if not user.history:
            return Show.objects.none()
        all_show_timestamps = []
        for date, times in user.history.items():
            for time, show_id in times.items():
                all_show_timestamps.append((f"{date} {time}", show_id))

        # Sort the list of (timestamp, show_id) tuples in reverse chronological order
        all_show_timestamps.sort(key=lambda x: x[0], reverse=True)

        last_shows_ids = []
        seen_show_ids = set()

        for _, show_id in all_show_timestamps:
            # Add the show_id to our list if it hasn't been seen before
            if show_id not in seen_show_ids:
                last_shows_ids.append(show_id)
                seen_show_ids.add(show_id)
            # Stop once we have 10 unique shows
            if len(last_shows_ids) >= 10:
                break
        # If no shows were found, return an empty queryset
        if not last_shows_ids:
            return Show.objects.none()
        # Fetch the Show objects from the database using the collected IDs.
        # We also use `F('id')` and `last_shows_ids` to preserve the original order.
        preserved = Case(*[When(id=pk, then=pos)
                         for pos, pk in enumerate(last_shows_ids)])
        queryset = Show.objects.filter(
            id__in=last_shows_ids).order_by(preserved)
        return queryset


class RandomShowsView(viewsets.ModelViewSet):
    serializer_class = ShowCardSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        if self.request.user.remember_home_tab:
            self.request.user.home_tab = 'random'; self.request.user.save()
        all_shows = Show.objects.all()
        if all_shows.count() > 10:
            return random.sample(list(all_shows), 10)
        return all_shows

# ------- Show Detail Views -------


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

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        show_id = instance.pk
        # Log into user's history data
        if request.user.is_authenticated:
            if datetime.now().strftime('%Y-%m-%d') not in request.user.history:
                request.user.history[datetime.now().strftime('%Y-%m-%d')] = {}
            request.user.history[datetime.now().strftime(
                '%Y-%m-%d')][datetime.now().strftime('%H:%M:%S')] = show_id
            request.user.save()

        # Standard serialization and response
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


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


class ArtistView(RetrieveAPIView):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer
    lookup_field = 'pk'
    lookup_url_kwarg = 'artist_id'


class CountryView(RetrieveAPIView):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    lookup_field = 'pk'
    lookup_url_kwarg = 'country_id'

# ------- Action Views -------

## Changing Episodes ##


class firstEpisode(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, show_id, current_season, current_episode):
        return changeEpisode(request.user, show_id, 1, 1, True, 'First Episode of the show!')


class previousEpisode(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, show_id, current_season, current_episode):
        if current_season == 1 and current_episode == 1:
            message = 'Already the first episode of first season!'
            new_season = new_episode = 1
            changed = False
        elif current_season != 1 and current_episode == 1:
            message = 'Back to first episode of previous season.'
            new_season = current_season - 1
            new_episode = Show.objects.get(
                id=show_id).episodes[str(new_season)]
            changed = True
        else:
            message = 'Previous episode...'
            new_season = current_season
            new_episode = current_episode - 1
            changed = True
        return changeEpisode(request.user, show_id, new_season, new_episode, changed, message)


class nextEpisode(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, show_id, current_season, current_episode):
        show_episodes = Show.objects.get(id=show_id).episodes
        if current_season == len(show_episodes) and current_episode == show_episodes[str(current_season)]:
            message = 'Last episode of last season!'
            new_season = current_season
            new_episode = current_episode
            changed = False
        elif current_season != len(show_episodes) and current_episode == show_episodes[str(current_season)]:
            message = 'First episode of the next season.'
            new_season = current_season + 1
            new_episode = 1
            changed = True
        else:
            message = 'Next Episode...'
            new_season = current_season
            new_episode = current_episode + 1
            changed = True
        return changeEpisode(request.user, show_id, new_season, new_episode, changed, message)


class lastEpisode(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, show_id, current_season, current_episode):
        show_episodes = Show.objects.get(id=show_id).episodes
        return changeEpisode(request.user, show_id, len(show_episodes), show_episodes[str(len(show_episodes))], True, 'Last episode of the show!')


## Updating Time Reached ##

class UpdateTimeReached(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, show_id, season, episode, time_reached):
        show = Show.objects.get(id=show_id)
        updateReached(request.user, show_id, show.kind,
                      season, episode, time_reached)
        return Response({
            'message': f'Updated time reached for the {show.kind.title()} \'{show.name}\' Season {season} Episode {episode} to {time_reached}',
            'new_time_reached': time_reached
        }, status=status.HTTP_200_OK)


## Toggling Status ##

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


def searchView(request, query):
    if query:
        results = []
        for country in Country.objects.filter(name__icontains=query):
            results.append({
                'result_type': 'country',
                'id': country.id,
                'name': country.name,
                # 'image': country.flag if country.flag else None,
                'description': country.description[:100] + '...' if len(country.description) > 100 else country.description
            })
        for language in Language.objects.filter(name__icontains=query):
            results.append({
                'result_type': 'language',
                'id': language.id,
                'name': language.name,
                'description': language.description[:100] + '...' if len(language.description) > 100 else language.description
            })
        for genre in Genre.objects.filter(name__icontains=query):
            results.append({
                'result_type': 'genre',
                'id': genre.id,
                'name': genre.name,
                'description': genre.description[:100] + '...' if len(genre.description) > 100 else genre.description
            })
        for label in Label.objects.filter(name__icontains=query):
            results.append({
                'result_type': 'label',
                'id': label.id,
                'name': label.name,
                'description': label.description[:100] + '...' if len(label.description) > 100 else label.description
            })
        for user in User.objects.filter(username__icontains=query):
            results.append({
                'result_type': 'user',
                'id': user.id,
                'name': user.username,
                'description': user.email if user.email else 'No email provided'
            })
        for show in Show.objects.filter(Q(name__icontains=query) | Q(description__icontains=query)):
            results.append({
                'result_type': 'show',
                'kind': show.kind,
                'id': show.id,
                'name': show.name,
                'description': show.description[:100] + '...' if len(show.description) > 100 else show.description
            })
        for artist in Artist.objects.filter(name__icontains=query):
            results.append({
                'result_type': 'artist',
                'id': artist.id,
                'name': artist.name,
                'description': artist.description[:100] + '...' if len(artist.description) > 100 else artist.description
            })

        return JsonResponse({'message': 'Search Complete', 'query': query, 'results': results}, status=200)
    else:
        return JsonResponse({'message': 'No search query provided'}, status=400)
