// TripMap.js
import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TripMap = ({ routeData }) => {
    useEffect(() => {
        const map = L.map('map').setView([0, 0], 2);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        if (routeData && routeData.geometry && routeData.geometry.coordinates) {
            const coordinates = routeData.geometry.coordinates.map(coord => [coord[1], coord[0]]);

            // Fit the map to the route
            const bounds = L.latLngBounds(coordinates);
            map.fitBounds(bounds);

            // Draw the route as a polyline
            L.polyline(coordinates, { color: 'blue' }).addTo(map);

            // Add markers for start and end points
            if (coordinates.length > 0) {
                L.marker(coordinates[0]).addTo(map)
                    .bindPopup('Starting Point')
                    .openPopup();

                L.marker(coordinates[coordinates.length - 1]).addTo(map)
                    .bindPopup('Destination')
                    .openPopup();
            }
        }

        return () => {
            map.remove();
        };
    }, [routeData]);

    return (
        <div>
            <div id="map" style={{ height: '600px', width: '100%' }}></div>
        </div>
    );
};

export default TripMap;
