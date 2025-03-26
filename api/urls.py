from django.urls import path
from .views import RouteAPIView, MapView,Register_view,LoginView,LogoutView

urlpatterns = [
    path('route/', RouteAPIView.as_view(), name='route'),
    path('map/', MapView.as_view(), name='map-view'),
    path('register/', Register_view, name='register'),
    path('login/', LoginView, name='login'),
    path('logout/', LogoutView, name='logout')

    
]
