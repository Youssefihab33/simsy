# from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import *
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

    class Meta:
        model = Show
        fields = ['id', 'name', 'sample', 'captions', 'image']


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

    episodes = models.JSONField(encoder=None, decoder=None, default=dict, blank=True)

    favorites = UserSerializer(many=True, read_only=True)
    watchlist = UserSerializer(many=True, read_only=True)

    finalized = serializers.BooleanField(read_only=True)

    created = models.DateTimeField()
    updated = models.DateTimeField()

    class Meta:
        model = Show
        fields = '__all__'
