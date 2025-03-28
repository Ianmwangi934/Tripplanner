import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TripMap = ({ routeData }) => {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        if (!mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current, {
                zoomControl: true,
                center: [0, 0], // Default center
                zoom: 2, // Default zoom level
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '© OpenStreetMap contributors',
            }).addTo(mapRef.current);
        }

        if (routeData?.geometry?.coordinates) {
            const coordinates = routeData.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            const bounds = L.latLngBounds(coordinates);
            mapRef.current.fitBounds(bounds);

            // Ensure map resizes properly
            setTimeout(() => {
                mapRef.current.invalidateSize();
            }, 500);

            // Remove existing polylines and markers
            mapRef.current.eachLayer((layer) => {
                if (layer instanceof L.Polyline || layer instanceof L.Marker) {
                    mapRef.current.removeLayer(layer);
                }
            });

            // Draw route polyline
            L.polyline(coordinates, { color: 'blue', weight: 4 }).addTo(mapRef.current);

            // Add start and end markers
            if (coordinates.length > 0) {
                L.marker(coordinates[0])
                    .addTo(mapRef.current)
                    .bindPopup('Starting Point')
                    .openPopup();

                L.marker(coordinates[coordinates.length - 1])
                    .addTo(mapRef.current)
                    .bindPopup('Destination')
                    .openPopup();
            }
        }

        // Resize map when the window resizes
        const handleResize = () => {
            setTimeout(() => {
                mapRef.current.invalidateSize();
            }, 500);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [routeData]);

    return (
        <div className="map-wrapper">
            <div ref={mapContainerRef} id="map"></div>
        </div>
    );
};

export default TripMap;
