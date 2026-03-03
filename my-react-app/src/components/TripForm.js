import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import TripMap from "./TripMap";
import { fabric } from "fabric";
import "../styles.css";



const activityColors = {
    "Off-Duty": "red",
    "On-Duty (Not Driving)": "yellow",
    "Driving": "blue",
    "Sleeper Berth": "purple"
};

const TripForm = () => {
    
    useEffect(() => {
        document.title = "Trip Planner | Route Management";
    }, []);
    const [formData, setFormData] = useState({
        current_location: "",
        pickup_location: "",
        dropoff_location: "",
    });

    const [routeData, setRouteData] = useState(null);
    const [logSheets, setLogSheets] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState("Off-Duty");
    const canvasRefs = useRef([]);
    const isMountedRef = useRef(true);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setRouteData(null);
        setLogSheets([]);
        setLoading(true);

        try {
            const response = await axios.post("https://tripplanner-3.onrender.com/api/route/", formData);
            console.log("API Response:", response.data);

            if (response.data.geometry && response.data.geometry.coordinates) {
                setRouteData(response.data);
            } else {
                setError("Failed to load route data. Please try again.");
            }

            if (response.data.image_urls && response.data.image_urls.length > 0) {
                setLogSheets(response.data.image_urls);
            }
        } catch (error) {
            console.error("Error:", error);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleActivityChange = (event) => {
        setSelectedActivity(event.target.value);
        canvasRefs.current.forEach(canvas => {
            if (canvas) {
                canvas.freeDrawingBrush.color = activityColors[event.target.value];
            }
        });
    };

    useEffect(() => {
    isMountedRef.current = true;

    canvasRefs.current = canvasRefs.current.slice(0, logSheets.length);

    logSheets.forEach((url, index) => {
        const imageElement = new Image();
        imageElement.src = url;

        imageElement.onload = () => {
            if (!isMountedRef.current) return;

            const canvasId = `canvas-${index}`;
            const canvasElement = document.getElementById(canvasId);
            if (!canvasElement) return;

            // Dispose safely
            if (canvasRefs.current[index]) {
                try {
                    canvasRefs.current[index].dispose();
                } catch (err) {
                    console.warn(err);
                }
            }

            canvasElement.width = imageElement.naturalWidth;
            canvasElement.height = imageElement.naturalHeight;

            const fabricCanvas = new fabric.Canvas(canvasId, {
                isDrawingMode: true,
                backgroundColor: "transparent",
            });

            fabricCanvas.freeDrawingBrush.width = 2;
            fabricCanvas.freeDrawingBrush.color =
                activityColors[selectedActivity];

            fabric.Image.fromURL(url, (img) => {
                if (!isMountedRef.current) return;

                img.set({
                    selectable: false,
                    evented: false,
                });

                fabricCanvas.setBackgroundImage(
                    img,
                    fabricCanvas.renderAll.bind(fabricCanvas)
                );
            });

            canvasRefs.current[index] = fabricCanvas;
        };
    });

    return () => {
        isMountedRef.current = false;

        canvasRefs.current.forEach((fabricCanvas) => {
            if (fabricCanvas) {
                try {
                    fabricCanvas.dispose();
                } catch (err) {
                    console.warn(err);
                }
            }
        });
    };
}, [logSheets, selectedActivity]);s

    return (
        
        <div className="container">
            {/* Page Title */}
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Trip Planner</h1>
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

            {error && <div className="error-message">{error}</div>}

            {routeData && <div className="map-container"><TripMap routeData={routeData} /></div>}

            {logSheets.length > 0 && (
                <div className="eld-log-container">
                    <h3>Generated ELD Logs:</h3>
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
