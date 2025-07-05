# from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import *
from users.models import CustomUser
from users.serializers import UserSerializer
User = get_user_model()

def get_in_f_or_w(user, show, type):
    if user.is_authenticated:
        match type:
            case 'f':
                return show.favorites.filter(id=user.id).exists()
            case 'w':
                return show.watchlist.filter(id=user.id).exists()
    return False

class GenreSerializer(serializers.ModelSerializer):
    name = serializers.CharField(read_only=True)
    image = serializers.ImageField(allow_empty_file=True, read_only=True)
    description = serializers.CharField(read_only=True)

    class Meta:
        model = Genre
        fields = '__all__'


class RatingSerializer(serializers.ModelSerializer):
    name = serializers.CharField(read_only=True)
    image = serializers.ImageField(allow_empty_file=True, read_only=True)
    description = serializers.CharField(read_only=True)

    class Meta:
        model = Rating
        fields = '__all__'


class LabelSerializer(serializers.ModelSerializer):
    name = serializers.CharField(read_only=True)
    image = serializers.ImageField(allow_empty_file=True, read_only=True)
    description = serializers.CharField(read_only=True)

    class Meta:
        model = Label
        fields = '__all__'


class LanguageSerializer(serializers.ModelSerializer):
    name = serializers.CharField(read_only=True)
    image = serializers.ImageField(allow_empty_file=True, read_only=True)
    description = serializers.CharField(read_only=True)

    class Meta:
        model = Language
        fields = '__all__'


class CountrySerializer(serializers.ModelSerializer):
    name = serializers.CharField(read_only=True)
    languages = LanguageSerializer(many=True, read_only=True)
    flag = serializers.ImageField(allow_empty_file=True, read_only=True)
    image = serializers.ImageField(allow_empty_file=True, read_only=True)
    description = serializers.CharField(read_only=True)

    class Meta:
        model = Country
        fields = '__all__'


class ArtistSerializer(serializers.ModelSerializer):
    name = serializers.CharField(read_only=True)
    birthYear = serializers.IntegerField(read_only=True)
    nationality = CountrySerializer(read_only=True)
    image = serializers.ImageField(allow_empty_file=True, read_only=True)
    description = serializers.CharField(read_only=True)

    class Meta:
        model = Artist
        fields = '__all__'


class ShowCardSerializer(serializers.ModelSerializer):
    name = serializers.CharField(read_only=True)
    sample = serializers.BooleanField(read_only=True)
    captions = serializers.BooleanField(read_only=True)
    image = serializers.ImageField(allow_empty_file=True, read_only=True)
    in_favorites = serializers.SerializerMethodField()
    in_watchlist = serializers.SerializerMethodField()

    def get_in_favorites(self, obj):
        return get_in_f_or_w(self.context['request'].user, obj, 'f')

    def get_in_watchlist(self, obj):
        return get_in_f_or_w(self.context['request'].user, obj, 'w')

    class Meta:
        model = Show
        fields = ['id', 'name', 'sample', 'captions', 'image', 'in_favorites', 'in_watchlist']


class ShowSerializer(serializers.ModelSerializer):
    name = serializers.CharField(read_only=True)
    year = serializers.CharField(read_only=True)
    kind = serializers.CharField(read_only=True)
    sample = serializers.BooleanField(read_only=True)
    captions = serializers.BooleanField(read_only=True)
    image = serializers.ImageField(allow_empty_file=True, read_only=True)
    imdb = serializers.CharField(read_only=True)
    description = serializers.CharField(read_only=True)

    # Relationships
    countries = CountrySerializer(many=True, read_only=True)
    languages = LanguageSerializer(many=True, read_only=True)
    genres = GenreSerializer(many=True, read_only=True)
    labels = LabelSerializer(many=True, read_only=True)
    rating = RatingSerializer(read_only=True)
    artists = ArtistSerializer(many=True, read_only=True)

    episodes = models.JSONField(
        encoder=None, decoder=None, default=dict, blank=True)

    favorites = UserSerializer(many=True, read_only=True)
    watchlist = UserSerializer(many=True, read_only=True)

    finalized = serializers.BooleanField(read_only=True)

    created = models.DateTimeField()
    updated = models.DateTimeField()

    class Meta:
        model = Show
        fields = ['id', 'name', 'year', 'kind', 'sample', 'captions', 'image',
                  'imdb', 'description', 'countries', 'languages', 'genres', 'labels',
                  'rating', 'artists', 'episodes', 'favorites', 'watchlist', 'finalized', 'created', 'updated']


class UserShowSerializer(serializers.ModelSerializer):
    episode_reached = serializers.SerializerMethodField()
    season_reached = serializers.SerializerMethodField()
    time_reached = serializers.SerializerMethodField()
    in_favorites = serializers.SerializerMethodField()
    in_watchlist = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['season_reached', 'episode_reached', 'time_reached', 'time_autosave', 'autoplay', 'view_captions', 'in_favorites', 'in_watchlist']

    def _get_show(self):
        """Helper to safely retrieve Show object from context."""
        request = self.context['request']
        if not request:
            raise serializers.ValidationError("Request context is missing.")
        show_id_str = str(self.context['show_id'])
        if not show_id_str:
            raise serializers.ValidationError("Show ID context is missing.")
        try:
            show = Show.objects.get(id=show_id_str)
        except Show.DoesNotExist:
            raise serializers.ValidationError(f"Show with ID {show_id_str} not found.")
        return show

    def _get_or_initialize_progress_value(self, obj, show_id, key_type, default_value=1):
        """
        Retrieves the season/episode progress. If not found or None, initializes it
        to default_value (typically 1) and saves the user object.
        """
        if show_id not in obj.episode_reached:
            obj.episode_reached[show_id] = {}; obj.save()
        try:
            current_value = obj.episode_reached[show_id][key_type]
        except KeyError:
            obj.episode_reached[show_id][key_type] = default_value; obj.save()
            return default_value
        return current_value

    def get_season_reached(self, obj):
        show = self._get_show()
        if show.kind == 'film':
            return None
        return self._get_or_initialize_progress_value(obj, str(show.id), 's')

    def get_episode_reached(self, obj):
        show = self._get_show()
        if show.kind == 'film':
            return None
        return self._get_or_initialize_progress_value(obj, str(show.id), 'e')

    def get_time_reached(self, obj):
        show = self._get_show()

        if show.kind == 'film':
            return obj.time_reached.get(str(show.id), 0)
        else:
            season = self._get_or_initialize_progress_value(obj, str(show.id), 's')
            episode = self._get_or_initialize_progress_value(obj, str(show.id), 'e')
            # Safely access the nested dictionary
            # Convert keys to string if they are stored as such in time_reached
            return obj.time_reached.get(str(show.id), {}).get(str(season), {}).get(str(episode), 0)
    
    def get_in_favorites(self, obj):
        show = self._get_show()
        return get_in_f_or_w(obj, show, 'f')

    def get_in_watchlist(self, obj):
        show = self._get_show()
        return get_in_f_or_w(obj, show, 'w')