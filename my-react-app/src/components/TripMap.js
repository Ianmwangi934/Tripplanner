import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TripMap = ({ routeData }) => {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null); // Reference to the map container

    useEffect(() => {
        if (!mapContainerRef.current) return; // Ensure container exists

        if (!mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current, { zoomControl: true });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '© OpenStreetMap contributors',
            }).addTo(mapRef.current);
        }

        if (routeData?.geometry?.coordinates) {
            const coordinates = routeData.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            const bounds = L.latLngBounds(coordinates);
            mapRef.current.fitBounds(bounds);

            requestAnimationFrame(() => {
                mapRef.current.invalidateSize();
            });

            // Clear existing layers before adding new ones
            mapRef.current.eachLayer(layer => {
                if (layer instanceof L.Polyline || layer instanceof L.Marker) {
                    mapRef.current.removeLayer(layer);
                }
            });

            // Draw polyline
            L.polyline(coordinates, { color: 'blue' }).addTo(mapRef.current);

            // Add start and end markers
            if (coordinates.length > 0) {
                L.marker(coordinates[0]).addTo(mapRef.current).bindPopup('Starting Point').openPopup();
                L.marker(coordinates[coordinates.length - 1]).addTo(mapRef.current).bindPopup('Destination').openPopup();
            }
        }
    }, [routeData]);

    return (
        <div style={{ width: '100%', height: '500px' }}>
            <div ref={mapContainerRef} id="map" style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
};

export default TripMap;
