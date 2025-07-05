# from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import *
from users.models import CustomUser
from users.serializers import UserSerializer
User = get_user_model()


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
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorites.filter(id=request.user.id).exists()
        return False

    def get_in_watchlist(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.watchlist.filter(id=request.user.id).exists()
        return False

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

    in_favorites = serializers.SerializerMethodField()
    in_watchlist = serializers.SerializerMethodField()

    def get_in_favorites(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorites.filter(id=request.user.id).exists()
        return False

    def get_in_watchlist(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.watchlist.filter(id=request.user.id).exists()
        return False

    class Meta:
        model = Show
        fields = ['id', 'name', 'year', 'kind', 'sample', 'captions', 'image',
                  'imdb', 'description', 'countries', 'languages', 'genres', 'labels',
                  'rating', 'artists', 'episodes', 'favorites', 'watchlist', 'finalized', 'created', 'updated',
                  'in_favorites', 'in_watchlist']


class UserShowSerializer(serializers.ModelSerializer):
    episode_reached = serializers.SerializerMethodField()
    season_reached = serializers.SerializerMethodField()
    time_reached = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['season_reached', 'episode_reached', 'time_reached', 'time_autosave', 'autoplay', 'view_captions']

    def get_x_reached(self, obj, type):
        show_id_str = str(self.context.get('request').parser_context['kwargs'].get('show_id'))
        show_kind = Show.objects.get(id=show_id_str).kind

        match type:
            case 's' | 'e':
                # Init
                if show_id_str not in obj.episode_reached:
                    obj.episode_reached[show_id_str] = {}
                if type not in obj.episode_reached[show_id_str] or obj.episode_reached[show_id_str][type] is None:
                    obj.episode_reached[show_id_str][type] = 1
                    obj.save()
                # Return
                return obj.episode_reached.get(show_id_str).get(type) if show_kind != 'film' else None
            case 't':
                return obj.time_reached.get(show_id_str, 0) if show_kind == 'film' else obj.time_reached.get(show_id_str, 0).get(str(self.get_season_reached(obj))).get(str(self.get_episode_reached(obj)))
        
    def get_episode_reached(self, obj):
        return self.get_x_reached(obj, 'e')
    def get_season_reached(self, obj):
        return self.get_x_reached(obj, 's')
    def get_time_reached(self, obj):
        return self.get_x_reached(obj, 't')