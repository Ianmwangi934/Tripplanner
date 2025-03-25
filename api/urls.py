from django.urls import path
from .views import RouteAPIView, MapView

urlpatterns = [
    path('route/', RouteAPIView.as_view(), name='route'),
    path('map/', MapView.as_view(), name='map-view')
]
