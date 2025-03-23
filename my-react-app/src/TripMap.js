import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const TripMap = ({ routeData }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [coordinates, setCoordinates] = useState(null);

    useEffect(() => {
        if (!routeData || !routeData.geometry || !routeData.geometry.coordinates) {
            console.error('Coordinates are not available.');
            setError('Failed to load route data. Please try again.');
            setLoading(false);
            return;
        }

        try {
            const coords = routeData.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            setCoordinates(coords);
            setLoading(false);
        } catch (error) {
            console.error('Error processing coordinates:', error);
            setError('Error processing coordinates. Please try again.');
            setLoading(false);
        }
    }, [routeData]);

    if (loading) {
        return <div>Loading map...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    if (!coordinates || coordinates.length === 0) {
        return <div>No valid route data to display.</div>;
    }

    const startPoint = coordinates[0];
    const endPoint = coordinates[coordinates.length - 1];

    return (
        <div style={{ height: '500px', marginTop: '20px' }}>
            <MapContainer center={startPoint} zoom={10} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                />

                <Polyline positions={coordinates} color="blue" />

                <Marker position={startPoint}>
                    <Popup>Start Point</Popup>
                </Marker>

                <Marker position={endPoint}>
                    <Popup>End Point</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default TripMap;
