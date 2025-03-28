import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import TripMap from "./TripMap";
import { fabric } from "fabric";
import "../styles.css";

const API_BASE_URL = process.env.REACT_APP_API_URL;
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
            const response = await axios.post("https://tripplanner-2.onrender.com/api/route/", formData);

            if (response.data.geometry && response.data.geometry.coordinates) {
                setRouteData(response.data);
            } else {
                setError("Failed to load route data. Please try again.");
            }

            if (response.data.image_urls && response.data.image_urls.length > 0) {
                setLogSheets(response.data.image_urls);
            }
        } catch (error) {
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
        canvasRefs.current = canvasRefs.current.slice(0, logSheets.length);

        logSheets.forEach((url, index) => {
            const imageElement = new Image();
            imageElement.src = url;

            imageElement.onload = () => {
                const canvasId = `canvas-${index}`;
                const canvasElement = document.getElementById(canvasId);
                if (!canvasElement) return;

                if (canvasRefs.current[index]) {
                    canvasRefs.current[index].dispose();
                }

                canvasElement.width = imageElement.naturalWidth;
                canvasElement.height = imageElement.naturalHeight;

                const fabricCanvas = new fabric.Canvas(canvasId, {
                    isDrawingMode: true,
                    backgroundColor: "transparent",
                });

                fabricCanvas.freeDrawingBrush.width = 2;
                fabricCanvas.freeDrawingBrush.color = activityColors[selectedActivity];

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

    return (
        <div className="container">
            <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Trip Planner</h1>
            <form className="trip-form" onSubmit={handleSubmit}>
                <label>Current Location:</label>
                <input type="text" name="current_location" value={formData.current_location} onChange={handleChange} required />

                <label>Pickup Location:</label>
                <input type="text" name="pickup_location" value={formData.pickup_location} onChange={handleChange} required />

                <label>Dropoff Location:</label>
                <input type="text" name="dropoff_location" value={formData.dropoff_location} onChange={handleChange} required />

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Generating Route..." : "Generate Route"}
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}

            {routeData && <TripMap routeData={routeData} />}

        </div>
    );
};

export default TripForm;
