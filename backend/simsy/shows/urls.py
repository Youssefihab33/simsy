from django.urls import path
from .views import searchView

urlpatterns = [
    path("search/<str:query>/", searchView),
]