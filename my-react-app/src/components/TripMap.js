import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TripMap = ({ routeData }) => {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        if (!mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current, { zoomControl: true });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 18,
                attribution: "© OpenStreetMap contributors",
            }).addTo(mapRef.current);
        }

        if (routeData?.geometry?.coordinates) {
            const coordinates = routeData.geometry.coordinates.map((coord) => [
                coord[1],
                coord[0],
            ]);
            const bounds = L.latLngBounds(coordinates);
            mapRef.current.fitBounds(bounds);

            // Fix for map not fitting properly inside the frame
            setTimeout(() => {
                mapRef.current.invalidateSize();
            }, 500);

            // Remove previous route layers before adding new ones
            mapRef.current.eachLayer((layer) => {
                if (layer instanceof L.Polyline || layer instanceof L.Marker) {
                    mapRef.current.removeLayer(layer);
                }
            });

            // Draw polyline
            L.polyline(coordinates, { color: "blue" }).addTo(mapRef.current);

            // Add start and end markers
            if (coordinates.length > 0) {
                L.marker(coordinates[0])
                    .addTo(mapRef.current)
                    .bindPopup("Starting Point")
                    .openPopup();

                L.marker(coordinates[coordinates.length - 1])
                    .addTo(mapRef.current)
                    .bindPopup("Destination")
                    .openPopup();
            }
        }

        // Cleanup function
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [routeData]);

    return (
        <div style={{ width: "100%", height: "500px", marginTop: "20px" }}>
            <div
                ref={mapContainerRef}
                id="map"
                style={{ width: "100%", height: "100%", borderRadius: "8px" }}
            ></div>
        </div>
    );
};

export default TripMap;
