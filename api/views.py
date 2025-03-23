import requests
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from io import BytesIO
from django.http import JsonResponse
from django.conf import settings
from django.core.files.base import ContentFile
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import GeneratedLog
from django.views import View
from openrouteservice import convert


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

            try:
                route_info = route_data['routes'][0]
                if isinstance(route_info, dict) and 'geometry' in route_info:
                    route_geometry = route_info['geometry']
                    coordinates = convert.decode_polyline(route_geometry)['coordinates']
                else:
                    return Response({"error": "Invalid 'routes' format or 'geometry' not found"}, status=status.HTTP_400_BAD_REQUEST)

            except Exception as e:
                return Response({"error": f"Error processing route information: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            fig, ax = plt.subplots(figsize=(12, 8))
            categories = ['Off-Duty', 'On-Duty (Not Driving)', 'Driving']
            colors = ['skyblue', 'orange', 'green']
            day_log = [2 if i < 11 else 0 for i in range(24)]

            for hour_index, activity in enumerate(day_log):
                ax.barh(0, 1, left=hour_index, color=colors[activity])

            ax.set_yticks([0])
            ax.set_yticklabels(['Day 1'])
            ax.set_xticks(range(0, 25))
            ax.set_xlabel('Hours of the Day')
            ax.set_title('ELD Log Sheet')
            plt.tight_layout()

            buffer = BytesIO()
            plt.savefig(buffer, format='png')
            plt.close()
            buffer.seek(0)

            log_image = GeneratedLog()
            log_image.image.save('eld_log.png', ContentFile(buffer.read()))
            log_image.save()

            return Response({
                "image_url": request.build_absolute_uri(log_image.image.url),
                "geometry": {
                    "coordinates": coordinates
                }
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MapView(View):
    def get(self, request):
        return render(request, 'api/map.html', {'map_api_key': settings.ORS_API_KEY})
