import random
from .imports import updateReached, changeEpisode
from .models import Artist, Language, Country, Genre, Rating, Label, Show
from .serializers import ArtistSerializer, LanguageSerializer, CountrySerializer, GenreSerializer, RatingSerializer, LabelSerializer, ShowSerializer, ShowLiteSerializer, SearchResultSerializer

from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.db.models import Case, When, Q, Exists, OuterRef
User = get_user_model()


# ------- Basic ViewSets -------
class ArtistsViewSet(ModelViewSet):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class LanguagesViewSet(ModelViewSet):
    queryset = Language.objects.all()
    serializer_class = LanguageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class CountriesViewSet(ModelViewSet):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class GenresViewSet(ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class RatingsViewSet(ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class LabelsViewSet(ModelViewSet):
    queryset = Label.objects.all()
    serializer_class = LabelSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ShowsViewSet(ModelViewSet):
    queryset = Show.objects.all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Show.objects.select_related('rating')

        # Optimization: Prefetch related fields for detail view to avoid N+1 queries
        # depth=2 in ShowSerializer means we need deeper prefetching
        if self.action == 'retrieve':
            queryset = queryset.prefetch_related(
                'artists__nationality',
                'countries__languages',
                'languages',
                'genres',
                'labels'
            )

        if user.is_authenticated:
            # Optimize in_favorites/in_watchlist checks with annotations to avoid N+1 queries during serialization
            queryset = queryset.annotate(
                in_favorites_annotated=Exists(
                    Show.objects.filter(favorites=user, pk=OuterRef('pk'))),
                in_watchlist_annotated=Exists(
                    Show.objects.filter(watchlist=user, pk=OuterRef('pk')))
            )
        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ShowSerializer
        return ShowLiteSerializer

    @action(detail=False)
    def favorites(self, request):
        queryset = self.get_queryset().filter(favorites=request.user)
        serializer = ShowLiteSerializer(
            queryset, context={'request': request}, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def watchlist(self, request):
        queryset = self.get_queryset().filter(watchlist=request.user)
        serializer = ShowLiteSerializer(
            queryset, context={'request': request}, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def new(self, request):
        queryset = self.get_queryset().order_by('-updated')[:25]
        serializer = ShowLiteSerializer(
            queryset, context={'request': request}, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def history(self, request):
        if not request.user.history:
            return Response([])
        all_show_timestamps = []
        for date, times in request.user.history.items():
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
            # Stop once we have 25 unique shows
            if len(last_shows_ids) >= 25:
                break
        # If no shows were found, return an empty queryset
        if not last_shows_ids:
            return Response([])
        # Fetch the Show objects from the database using the collected IDs.
        # We also use `F('id')` and `last_shows_ids` to preserve the original order.
        preserved = Case(*[When(id=pk, then=pos)
                         for pos, pk in enumerate(last_shows_ids)])
        queryset = self.get_queryset().filter(
            id__in=last_shows_ids).order_by(preserved)
        serializer = ShowLiteSerializer(
            queryset, context={'request': request}, many=True)
        return Response(serializer.data)

    @action(detail=False)
    def random(self, request):
        # Optimization: Fetch only IDs first to avoid evaluating all fields of all shows in memory
        all_pks = list(Show.objects.values_list('pk', flat=True))
        if len(all_pks) > 10:
            sample_pks = random.sample(all_pks, 10)
            queryset = self.get_queryset().filter(pk__in=sample_pks)
        else:
            queryset = self.get_queryset()
        serializer = ShowLiteSerializer(
            queryset, context={'request': request}, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def toggleFavorite(self, request, pk=None):
        show = self.get_object()
        if show.favorites.filter(id=request.user.id).exists():
            show.favorites.remove(request.user)
            message = 'Show removed from favorites successfully!'
            current_status = False
        else:
            show.favorites.add(request.user)
            message = 'Show added to favorites successfully!'
            current_status = True

        return Response({
            'message': message,
            'in_favorites': current_status
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def toggleWatchlist(self, request, pk=None):
        show = self.get_object()
        if show.watchlist.filter(id=request.user.id).exists():
            show.watchlist.remove(request.user)
            message = 'Show removed from watchlist successfully!'
            current_status = False
        else:
            show.watchlist.add(request.user)
            message = 'Show added to watchlist successfully!'
            current_status = True

        return Response({
            'message': message,
            'in_watchlist': current_status
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def first_episode(self, request, pk=None):
        show = self.get_object()
        return changeEpisode(request.user, show.id, 1, 1, True, 'First Episode of the show!')

    @action(detail=True, methods=['post'])
    def previous_episode(self, request, pk=None):
        show = self.get_object()
        current_season = int(request.data.get('season', 1))
        current_episode = int(request.data.get('episode', 1))

        if current_season == 1 and current_episode == 1:
            message = 'Already the first episode of first season!'
            new_season = new_episode = 1
            changed = False
        elif current_season != 1 and current_episode == 1:
            message = 'Back to first episode of previous season.'
            new_season = current_season - 1
            new_episode = show.episodes[str(new_season)]
            changed = True
        else:
            message = 'Previous episode...'
            new_season = current_season
            new_episode = current_episode - 1
            changed = True
        return changeEpisode(request.user, show.id, new_season, new_episode, changed, message)

    @action(detail=True, methods=['post'])
    def next_episode(self, request, pk=None):
        show = self.get_object()
        current_season = int(request.data.get('season', 1))
        current_episode = int(request.data.get('episode', 1))

        show_episodes = show.episodes
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
        return changeEpisode(request.user, show.id, new_season, new_episode, changed, message)

    @action(detail=True, methods=['post'])
    def last_episode(self, request, pk=None):
        show = self.get_object()
        show_episodes = show.episodes
        return changeEpisode(request.user, show.id, len(show_episodes), show_episodes[str(len(show_episodes))], True, 'Last episode of the show!')

    @action(detail=True, methods=['post'])
    def jump_to_episode(self, request, pk=None):
        show = self.get_object()
        new_season = int(request.data.get('season', 1))
        new_episode = int(request.data.get('episode', 1))
        message = f'Jumped to Season {new_season} Episode {new_episode}'
        return changeEpisode(request.user, show.id, new_season, new_episode, True, message)

    @action(detail=True, methods=['post'])
    def update_time_reached(self, request, pk=None):
        show = self.get_object()
        season = int(request.data.get('season', 1))
        episode = int(request.data.get('episode', 1))
        time_reached = int(request.data.get('time_reached', 0))

        updateReached(request.user, show.id, show.kind,
                      season, episode, time_reached)
        return Response({
            'message': f'Updated time reached for the {show.kind.title()} \'{show.name}\' Season {season} Episode {episode} to {time_reached}',
            'new_time_reached': time_reached
        }, status=status.HTTP_200_OK)

# ------- Action Views -------


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def searchView(request, query):
    if query:
        results = []
        for country in Country.objects.filter(name__icontains=query):
            results.append({
                'result_type': 'country',
                'id': country.id,
                'name': country.name,
                'image': country.flag.url if country.flag else (country.image.url if country.image else None),
                'description': country.description[:100] + '...' if len(country.description) > 100 else country.description
            })
        for language in Language.objects.filter(name__icontains=query):
            results.append({
                'result_type': 'language',
                'id': language.id,
                'name': language.name,
                'image': language.image.url if language.image else None,
                'description': language.description[:100] + '...' if len(language.description) > 100 else language.description
            })
        for genre in Genre.objects.filter(name__icontains=query):
            results.append({
                'result_type': 'genre',
                'id': genre.id,
                'name': genre.name,
                'image': genre.image.url if genre.image else None,
                'description': genre.description[:100] + '...' if len(genre.description) > 100 else genre.description
            })
        for label in Label.objects.filter(name__icontains=query):
            results.append({
                'result_type': 'label',
                'id': label.id,
                'name': label.name,
                'image': label.image.url if label.image else None,
                'description': label.description[:100] + '...' if len(label.description) > 100 else label.description
            })
        for rating in Rating.objects.filter(name__icontains=query):
            results.append({
                'result_type': 'rating',
                'id': rating.id,
                'name': rating.name,
                'image': rating.image.url if rating.image else None,
                'description': rating.description[:100] + '...' if len(rating.description) > 100 else rating.description
            })
        for user in User.objects.filter(username__icontains=query).select_related('nationality'):
            results.append({
                'result_type': 'user',
                'id': user.id,
                'name': user.username,
                'image': user.profile_picture.url if user.profile_picture else None,
                'description': user.bio[:100] + '...' if user.bio and len(user.bio) > 100 else (user.bio or 'No bio provided'),
                'nationality': user.nationality.name if user.nationality else None
            })
        for show in Show.objects.filter(Q(name__icontains=query) | Q(description__icontains=query)).select_related('rating'):
            results.append({
                'result_type': 'show',
                'kind': show.kind,
                'id': show.id,
                'name': show.name,
                'image': show.image.url if show.image else None,
                'description': show.description[:100] + '...' if len(show.description) > 100 else show.description,
                'year': show.year,
                'rating': show.rating.name if show.rating else None
            })
        for artist in Artist.objects.filter(name__icontains=query).select_related('nationality'):
            results.append({
                'result_type': 'artist',
                'id': artist.id,
                'name': artist.name,
                'image': artist.image.url if artist.image else None,
                'description': artist.description[:100] + '...' if len(artist.description) > 100 else artist.description,
                'birthYear': artist.birthYear,
                'age': artist.age,
                'nationality': artist.nationality.name if artist.nationality else None
            })

        if len(results) > 50:
            return Response({'message': 'Be More Specific', 'query': [], 'results': []}, status=status.HTTP_300_MULTIPLE_CHOICES)
        serializer = SearchResultSerializer(results, many=True)
        return Response({'message': 'Search Complete', 'query': query, 'results': serializer.data}, status=status.HTTP_200_OK)
    else:
        return Response({'message': 'No search query provided'}, status=status.HTTP_400_BAD_REQUEST)
