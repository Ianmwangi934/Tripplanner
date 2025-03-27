import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import TripMap from "./TripMap";
import { fabric } from "fabric";
import "../styles.css";

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Define activity colors
const activityColors = {
    "Off-Duty": "red",
    "On-Duty (Not Driving)": "yellow",
    "Driving": "blue",
    "Sleeper Berth": "purple"
};

const TripForm = () => {
    // Set page title on mount
    useEffect(() => {
        document.title = "Trip Planner | Route Management";
    }, []);

    // State for form inputs
    const [formData, setFormData] = useState({
        current_location: "",
        pickup_location: "",
        dropoff_location: "",
    });

    // State for API responses
    const [routeData, setRouteData] = useState(null);
    const [logSheets, setLogSheets] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // State for activity selection
    const [selectedActivity, setSelectedActivity] = useState("Off-Duty");
    const canvasRefs = useRef([]);

    // Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setRouteData(null);
        setLogSheets([]);
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/route/`, formData);
            console.log("API Response:", response.data);

            if (response.data.geometry?.coordinates) {
                setRouteData(response.data);
            } else {
                setError("Failed to load route data. Please try again.");
            }

            if (response.data.image_urls?.length > 0) {
                setLogSheets(response.data.image_urls);
            }
        } catch (error) {
            console.error("Error:", error);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle activity selection change
    const handleActivityChange = (event) => {
        setSelectedActivity(event.target.value);
        canvasRefs.current.forEach(canvas => {
            if (canvas) {
                canvas.freeDrawingBrush.color = activityColors[event.target.value];
            }
        });
    };

    // Initialize Fabric.js for log sheets
    useEffect(() => {
        canvasRefs.current = canvasRefs.current.slice(0, logSheets.length);
        
        logSheets.forEach((url, index) => {
            const imageElement = new Image();
            imageElement.src = url;

            imageElement.onload = () => {
                const canvasId = `canvas-${index}`;
                const canvasElement = document.getElementById(canvasId);
                if (!canvasElement) return;

                // Dispose previous canvas instance if exists
                if (canvasRefs.current[index]) {
                    canvasRefs.current[index].dispose();
                }

                // Create a new Fabric.js canvas
                const fabricCanvas = new fabric.Canvas(canvasId, {
                    isDrawingMode: true,
                    backgroundColor: "transparent",
                });

                fabricCanvas.freeDrawingBrush.width = 2;
                fabricCanvas.freeDrawingBrush.color = activityColors[selectedActivity];

                // Set image as background in Fabric.js
                fabric.Image.fromURL(url, (img) => {
                    img.set({ selectable: false, evented: false });
                    fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas));
                });

                canvasRefs.current[index] = fabricCanvas;
            };
        });

        return () => {
            canvasRefs.current.forEach((fabricCanvas) => {
                if (fabricCanvas) {
                    fabricCanvas.dispose();
                }
            });
        };
    }, [logSheets]);

    // Handle responsive layout adjustments
    useEffect(() => {
        const adjustLayout = () => {
            const screenWidth = window.innerWidth;
            if (screenWidth < 768) {
                console.log("Switching to mobile layout");
            }
        };

        window.addEventListener("resize", adjustLayout);
        adjustLayout(); // Run on mount

        return () => window.removeEventListener("resize", adjustLayout);
    }, []);

    return (
        <div className="container">
            {/* Page Title */}
            <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Trip Planner</h1>

            {/* Trip Input Form */}
            <form className="trip-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Current Location:</label>
                    <input type="text" name="current_location" value={formData.current_location} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Pickup Location:</label>
                    <input type="text" name="pickup_location" value={formData.pickup_location} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Dropoff Location:</label>
                    <input type="text" name="dropoff_location" value={formData.dropoff_location} onChange={handleChange} required />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Generating Route..." : "Generate Route"}
                </button>
            </form>

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Display Map if Route Data Exists */}
            {routeData && <div className="map-container"><TripMap routeData={routeData} /></div>}

            {/* ELD Logs Section */}
            {logSheets.length > 0 && (
                <div className="eld-log-container">
                    <h3>Generated ELD Logs:</h3>
                    
                    {/* Activity Selector */}
                    <div className="activity-selector">
                        <label>Activity:</label>
                        <select onChange={handleActivityChange} value={selectedActivity}>
                            {Object.keys(activityColors).map((activity) => (
                                <option key={activity} value={activity}>
                                    {activity}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Display Canvas for Log Sheets */}
                    {logSheets.map((url, index) => (
                        <div key={index} className="eld-log-sheet" style={{ position: 'relative' }}>
                            <canvas 
                                id={`canvas-${index}`} 
                                style={{ 
                                    position: 'absolute', 
                                    left: 0, 
                                    top: 0, 
                                    zIndex: 2,
                                    border: "2px solid black"
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TripForm;
