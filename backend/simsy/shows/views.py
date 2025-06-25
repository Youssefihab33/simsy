from rest_framework import permissions, viewsets
from .serializers import *
import random

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

class NewShowsView(viewsets.ModelViewSet):
    queryset = Show.objects.order_by('-updated')[:15]
    serializer_class = ShowSerializer
    permission_classes = [permissions.AllowAny]

class RandomShowsView(viewsets.ModelViewSet):
    queryset = random.sample(list(Show.objects.all()), 15) if Show.objects.all().count() > 15 else Show.objects.all()
    serializer_class = ShowSerializer
    permission_classes = [permissions.AllowAny]