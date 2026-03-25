from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Artist, Language, Country, Genre, Rating, Label, Show
from datetime import date
current_year = date.today().strftime('%Y')
User = get_user_model()


# A simple function to determine if a show is registered in Favorites or Watchlist for the current user
def get_in_f_or_w(user, show, change_type):
    if user.is_authenticated:
        match change_type:
            case 'f':
                return show.favorites.filter(id=user.id).exists()
            case 'w':
                return show.watchlist.filter(id=user.id).exists()
    return False


# Serializers start here
class ShowSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    episodes_count = serializers.SerializerMethodField()
    season_reached = serializers.SerializerMethodField()
    episode_reached = serializers.SerializerMethodField()
    time_reached = serializers.SerializerMethodField()
    in_favorites = serializers.SerializerMethodField()
    in_watchlist = serializers.SerializerMethodField()
    view_captions = serializers.SerializerMethodField()
    reached_times = serializers.SerializerMethodField()

    def get_age(self, show):
        return int(current_year) - int(show.year[0:4])

    # Helper function to stay DRY
    def _get_x_reached(self, show, key_type, default_value=0):
        user = self.context.get('request').user
        if not user or not user.is_authenticated:
            return default_value
        show_id = str(show.id)
        # return from memory; initialization in DB should happen on write, not read
        user_reached = user.reached.get(show_id, {})
        return user_reached.get(key_type, default_value)

    def get_episodes_count(self, show):
        try:
            episodes_count = sum(show.episodes.values()) if sum(
                show.episodes.values()) else None
        except:
            episodes_count = 'N/A'
        return episodes_count

    def get_season_reached(self, show):
        return None if show.kind == 'film' else self._get_x_reached(show, 's', 1)

    def get_episode_reached(self, show):
        return None if show.kind == 'film' else self._get_x_reached(show, 'e', 1)

    def get_time_reached(self, show):
        user = self.context.get('request').user
        if show.kind == 'film':
            return self._get_x_reached(show, 't', 0)
        # Nested logic for series
        s, e = self.get_season_reached(show), self.get_episode_reached(show)
        return user.reached.get(str(show.id), {}).get('t', {}).get(str(s), {}).get(str(e), 0)

    def get_in_favorites(self, show):
        # Optimization: Use annotated value if available to avoid N+1 queries
        if hasattr(show, 'in_favorites_annotated'):
            return show.in_favorites_annotated
        return get_in_f_or_w(self.context['request'].user, show, 'f')

    def get_in_watchlist(self, show):
        # Optimization: Use annotated value if available to avoid N+1 queries
        if hasattr(show, 'in_watchlist_annotated'):
            return show.in_watchlist_annotated
        return get_in_f_or_w(self.context['request'].user, show, 'w')

    def get_view_captions(self, show):
        user = self.context.get('request').user
        return user.view_captions if user.is_authenticated else True

    def get_reached_times(self, show):
        user = self.context.get('request').user
        if not user or not user.is_authenticated:
            return {}
        return user.reached.get(str(show.id), {}).get('t', {})

    class Meta:
        model = Show
        exclude = ['favorites', 'watchlist']
        depth = 2


class ShowLiteSerializer(ShowSerializer):
    class Meta:
        model = Show
        exclude = ['artists', 'languages', 'countries',
                   'genres', 'labels', 'favorites', 'watchlist']
        depth = 1


class ArtistSerializer(serializers.ModelSerializer):
    shows = ShowLiteSerializer(many=True, read_only=True)
    age = serializers.SerializerMethodField()

    def get_age(self, artist):
        return int(current_year) - int(artist.birthYear)

    class Meta:
        model = Artist
        fields = '__all__'
        depth = 1


class LabelSerializer(serializers.ModelSerializer):
    shows = ShowLiteSerializer(many=True, read_only=True)

    class Meta:
        model = Label
        fields = '__all__'


class CountrySerializer(serializers.ModelSerializer):
    shows = ShowLiteSerializer(many=True, read_only=True)
    artists = ArtistSerializer(many=True, read_only=True)

    class Meta:
        model = Country
        fields = '__all__'
        depth = 2


class GenreSerializer(serializers.ModelSerializer):
    shows = ShowLiteSerializer(many=True, read_only=True)

    class Meta:
        model = Genre
        fields = '__all__'


class RatingSerializer(serializers.ModelSerializer):
    shows = ShowLiteSerializer(many=True, read_only=True)

    class Meta:
        model = Rating
        fields = '__all__'


class LanguageSerializer(serializers.ModelSerializer):
    shows = ShowLiteSerializer(many=True, read_only=True)
    countries = CountrySerializer(many=True, read_only=True)

    class Meta:
        model = Language
        fields = '__all__'


class SearchResultSerializer(serializers.Serializer):
    result_type = serializers.CharField()
    id = serializers.IntegerField()
    name = serializers.CharField()
    image = serializers.CharField(allow_null=True)
    description = serializers.CharField(allow_blank=True, allow_null=True)

    # Specific fields for Shows
    kind = serializers.CharField(required=False)
    year = serializers.CharField(required=False)
    rating = serializers.CharField(required=False)

    # Specific fields for Artists/Users
    birthYear = serializers.IntegerField(required=False)
    age = serializers.IntegerField(required=False)
    nationality = serializers.CharField(required=False)
