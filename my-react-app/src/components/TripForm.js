import React, { useState } from 'react';
import axios from 'axios';
import TripMap from './TripMap';

const TripForm = () => {
    const [formData, setFormData] = useState({
        current_location: '',
        pickup_location: '',
        dropoff_location: ''
    });

    const [routeData, setRouteData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setRouteData(null);
        setLoading(true);

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/route/', formData);
            console.log('API Response:', response.data);

            if (response.data.geometry && response.data.geometry.coordinates) {
                setRouteData(response.data);
            } else {
                console.error("Route data is missing or invalid.");
                setError("Failed to load route data. Please try again.");
            }
        } catch (error) {
            console.error('Error:', error);
            if (error.response && error.response.data.error) {
                setError(error.response.data.error);
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Current Location:</label>
                    <input 
                        type="text" 
                        name="current_location" 
                        value={formData.current_location} 
                        onChange={handleChange} 
                        required
                    />
                </div>

                <div>
                    <label>Pickup Location:</label>
                    <input 
                        type="text" 
                        name="pickup_location" 
                        value={formData.pickup_location} 
                        onChange={handleChange} 
                        required
                    />
                </div>

                <div>
                    <label>Dropoff Location:</label>
                    <input 
                        type="text" 
                        name="dropoff_location" 
                        value={formData.dropoff_location} 
                        onChange={handleChange} 
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Generating Route..." : "Generate Route"}
                </button>
            </form>

            {error && <div style={{color: 'red'}}>{error}</div>}

            {routeData && (
                <div>
                    <h3>Route Map:</h3>
                    <TripMap routeData={routeData} />
                </div>
            )}
        </div>
    );
};

export default TripForm;
