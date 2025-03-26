import requests
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from io import BytesIO
from django.http import JsonResponse
from django.conf import settings
from django.core.files.base import ContentFile
from django.shortcuts import render, redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import GeneratedLog, TripLog
from django.views import View
from openrouteservice import convert
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.models import User
from django.contrib import messages
import json
from django.views.decorators.csrf import csrf_exempt

class RouteAPIView(APIView):
    def post(self, request):
        data = request.data
        current_location = data.get('current_location')
        pickup_location = data.get('pickup_location')
        dropoff_location = data.get('dropoff_location')

        if not all([current_location, pickup_location, dropoff_location]):
            return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ors_api_key = settings.ORS_API_KEY

            def get_coordinates(location):
                geocode_url = "https://api.openrouteservice.org/geocode/search"
                headers = {'Authorization': ors_api_key}
                params = {'text': location, 'size': 1}

                response = requests.get(geocode_url, headers=headers, params=params)
                response_data = response.json()

                if response_data['features']:
                    return response_data['features'][0]['geometry']['coordinates']
                return None

            current_coords = get_coordinates(current_location)
            pickup_coords = get_coordinates(pickup_location)
            dropoff_coords = get_coordinates(dropoff_location)

            if not all([current_coords, pickup_coords, dropoff_coords]):
                return Response({"error": "Failed to get coordinates for one or more locations"}, status=status.HTTP_400_BAD_REQUEST)

            # Request route data
            route_uri = "https://api.openrouteservice.org/v2/directions/driving-car"
            route_headers = {'Authorization': ors_api_key}
            route_json = {"coordinates": [current_coords, pickup_coords, dropoff_coords]}

            route_response = requests.post(route_uri, headers=route_headers, json=route_json)

            if route_response.status_code != 200:
                return Response({
                    "error": f"Failed to retrieve route data. Status Code: {route_response.status_code}",
                    "details": route_response.json()
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            route_data = route_response.json()

            # Extract route geometry
            try:
                route_info = route_data['routes'][0]
                if isinstance(route_info, dict) and 'geometry' in route_info:
                    route_geometry = route_info['geometry']
                    coordinates = convert.decode_polyline(route_geometry)['coordinates']
                else:
                    return Response({"error": "Invalid 'routes' format or 'geometry' not found"}, status=status.HTTP_400_BAD_REQUEST)

            except Exception as e:
                return Response({"error": f"Error processing route information: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Extract distance
            try:
                distance_km = route_data['routes'][0]['summary']['distance'] / 1000  # Convert meters to km
            except KeyError:
                return Response({"error": "Failed to extract route distance"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Estimate number of days based on distance
            avg_speed_kmh = 60
            estimated_hours = distance_km / avg_speed_kmh
            num_days = max(1, int(estimated_hours / 24) + 1)

            log_images = []
            activity_labels = ["Off-Duty", "Sleeper Berth", "Driving", "On-Duty (Not Driving)"]
            activity_colors = ["#FFD700", "#FFFF99", "#ADD8E6", "#FFA07A"]  # Yellow shades & light blue for sections

            for day in range(num_days):
                fig, ax = plt.subplots(figsize=(12, 4))

                # Draw background color sections for each activity
                for i, color in enumerate(activity_colors):
                    ax.fill_betweenx([i, i + 1], 0, 24, color=color, alpha=0.6)

                # Draw the grid lines
                for hour in range(25):
                    ax.axvline(hour, color="black", linewidth=1, linestyle="--")
                for i in range(5):
                    ax.axhline(i, color="black", linewidth=1)

                # Set labels and title
                ax.set_yticks([0.5, 1.5, 2.5, 3.5])
                ax.set_yticklabels(activity_labels)
                ax.set_xticks(range(0, 25))
                ax.set_xticklabels([f"{i}:00" for i in range(25)])
                ax.set_xlabel("Hours of the Day")
                ax.set_title(f"ELD Log Sheet - Day {day + 1}")
                ax.set_xlim(0, 24)
                ax.set_ylim(0, 4)
                plt.tight_layout()

                # Save image to buffer
                buffer = BytesIO()
                plt.savefig(buffer, format='png', dpi=150)
                plt.close()
                buffer.seek(0)

                log_image = GeneratedLog()
                log_image.image.save(f'eld_log_day_{day + 1}.png', ContentFile(buffer.read()))
                log_image.save()

                log_images.append(request.build_absolute_uri(log_image.image.url))

            return Response({
                "image_urls": log_images,
                "geometry": {
                    "coordinates": coordinates
                },
                "num_days": num_days
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MapView(View):
    def get(self, request):
        return render(request, 'api/map.html', {'map_api_key': settings.ORS_API_KEY})

@csrf_exempt
def Register_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))  # Parse JSON from React request
            
            username = data.get("username")
            email = data.get("email")
            password = data.get("password")
            confirm_password = data.get("confirm_password")

            if not username or not email or not password or not confirm_password:
                return JsonResponse({"error": "All fields are required."}, status=400)

            if password != confirm_password:
                return JsonResponse({"error": "Passwords do not match."}, status=400)

            if User.objects.filter(username=username).exists():
                return JsonResponse({"error": "Username already taken."}, status=400)

            if User.objects.filter(email=email).exists():
                return JsonResponse({"error": "Email already registered."}, status=400)

            # Create user
            user = User.objects.create_user(username=username, email=email, password=password)
            user.save()

            return JsonResponse({"message": "Registration successful. Please login."}, status=201)
        
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data."}, status=400)

    return JsonResponse({"error": "Invalid request method."}, status=405)
    

@csrf_exempt
def LoginView(request):
    if request.method == "POST":
        try:
            # Parse JSON data from React request
            data = json.loads(request.body.decode("utf-8"))
            username = data.get("username")
            password = data.get("password")

            user = authenticate(request, username=username, password=password)

            if user:
                login(request, user)
                return JsonResponse({"message": "Login successful."}, status=200)
            else:
                return JsonResponse({"error": "Invalid Username or Password"}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data."}, status=400)

    # If method is not POST, return an error
    return JsonResponse({"error": "Invalid request method."}, status=405)

@csrf_exempt
def LogoutView(request):
    if request.method == "POST":
        logout(request)
        return JsonResponse({"message": "Logout successful."}, status=200)

    return JsonResponse({"error": "Invalid request method."}, status=405)

    
