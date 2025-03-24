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
    const [imageUrls, setImageUrls] = useState([]);
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
        setImageUrls([]);
        setLoading(true);

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/route/', formData);
            console.log('API Response:', response.data);

            if (response.data.geometry && response.data.geometry.coordinates) {
                setRouteData(response.data);
            } else {
                setError("Failed to load route data. Please try again.");
            }

            if (response.data.image_urls && response.data.image_urls.length > 0) {
                setImageUrls(response.data.image_urls);
            }
        } catch (error) {
            console.error('Error:', error);
            if (error.response && error.response.data.error) {
                setError(error.response.data.error);
            } else {
                setError("Something went wrong. Please try again.");
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
                    <input type="text" name="current_location" value={formData.current_location} onChange={handleChange} required />
                </div>
                <div>
                    <label>Pickup Location:</label>
                    <input type="text" name="pickup_location" value={formData.pickup_location} onChange={handleChange} required />
                </div>
                <div>
                    <label>Dropoff Location:</label>
                    <input type="text" name="dropoff_location" value={formData.dropoff_location} onChange={handleChange} required />
                </div>
                <button type="submit" disabled={loading}>{loading ? "Generating Route..." : "Generate Route"}</button>
            </form>

            {error && <div style={{color: 'red'}}>{error}</div>}

            {routeData && <TripMap routeData={routeData} />}

            {imageUrls.length > 0 && (
                <div>
                    <h3>Generated ELD Logs:</h3>
                    {imageUrls.map((url, index) => (
                        <img key={index} src={url} alt={`ELD Log ${index + 1}`} style={{ maxWidth: "100%", height: "auto" }} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TripForm;
