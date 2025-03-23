from django.urls import path
from . import views

urlpatterns = [
    path('route/', views.RouteAPIView.as_view(), name='route'),
    path('map/', views.MapView.as_view(), name='map-view')
]
