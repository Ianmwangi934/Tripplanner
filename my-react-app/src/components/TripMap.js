import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TripMap = ({ routeData }) => {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null); // Reference to the map container

    useEffect(() => {
        if (!mapRef.current && mapContainerRef.current) {
            mapRef.current = L.map(mapContainerRef.current, { zoomControl: true });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '© OpenStreetMap contributors',
            }).addTo(mapRef.current);
        }

        if (routeData && routeData.geometry && routeData.geometry.coordinates) {
            const coordinates = routeData.geometry.coordinates.map(coord => [coord[1], coord[0]]);

            // Fit the map to the route
            const bounds = L.latLngBounds(coordinates);
            mapRef.current.fitBounds(bounds);

            // Ensure the map resizes properly
            setTimeout(() => {
                if (mapRef.current) {
                    mapRef.current.invalidateSize();
                }
            }, 500);

            // Remove any existing polylines before adding a new one
            mapRef.current.eachLayer(layer => {
                if (layer instanceof L.Polyline) {
                    mapRef.current.removeLayer(layer);
                }
            });

            // Draw the route as a polyline
            L.polyline(coordinates, { color: 'blue' }).addTo(mapRef.current);

            // Add markers for start and end points
            if (coordinates.length > 0) {
                L.marker(coordinates[0]).addTo(mapRef.current).bindPopup('Starting Point').openPopup();
                L.marker(coordinates[coordinates.length - 1]).addTo(mapRef.current).bindPopup('Destination').openPopup();
            }
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.invalidateSize(); // Ensure resizing is handled
            }
        };

    }, [routeData]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div ref={mapContainerRef} className="map-container"></div>
        </div>
    );
};

export default TripMap;
